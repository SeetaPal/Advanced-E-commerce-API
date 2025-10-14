const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Payment = require('../models/paymentModel');
const queue = require('../utils/queue');

const Joi = require('joi');

const checkoutSchema = Joi.object({ }); 


exports.checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if(!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart empty' });

    const productIds = cart.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    const orderItems = [];
    let totalAmount = 0;

    for(const ci of cart.items){
      const prod = productMap.get(ci.productId.toString());
      if(!prod) return res.status(400).json({ error: `Product ${ci.productId} not found` });
      const available = prod.totalStock - prod.reservedStock;
      if(available < ci.quantity) return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });

      orderItems.push({
        productId: prod._id,
        quantity: ci.quantity,
        priceAtPurchase: prod.price
      });
      prod.reservedStock += ci.quantity;
      totalAmount += prod.price * ci.quantity;
      await prod.save();
    }

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'PENDING_PAYMENT'
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch(err){
    next(err);
  }
};

exports.pay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not your order' });
    if (order.status !== 'PENDING_PAYMENT') return res.status(400).json({ error: 'Order not in PENDING_PAYMENT state' });

    const succeed = req.body.succeed !== false; // default succeed
    const transactionId = `txn_${Date.now()}`;

    if (!succeed) {
      await Payment.create({ orderId: order._id, transactionId, amount: order.totalAmount, status: 'FAILED' });
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { reservedStock: -item.quantity } });
      }
      order.status = 'CANCELLED';
      await order.save();
      return res.status(200).json({ message: 'Payment failed, order cancelled' });
    }

    // Payment succeeded
    await Payment.create({ orderId: order._id, transactionId, amount: order.totalAmount, status: 'SUCCESS' });

    for (const item of order.items) {
      const prod = await Product.findById(item.productId);
      if (!prod || prod.reservedStock < item.quantity) return res.status(409).json({ error: 'Reserved stock inconsistent' });
      prod.totalStock -= item.quantity;
      prod.reservedStock -= item.quantity;
      if (prod.totalStock < 0) return res.status(500).json({ error: 'Stock underflow' });
      await prod.save();
    }

    order.status = 'PAID';
    await order.save();

    // Dispatch async email job
    queue.enqueue('send_confirmation_email', { orderId: order._id.toString(), userId: order.userId.toString() });

    res.json({ message: 'Payment successful', orderId: order._id });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = require('../utils/pagination').parsePagination(req);
    const filter = { userId: req.user._id };
    if(req.query.status) filter.status = req.query.status;
    const total = await Order.countDocuments(filter);
    const items = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('items.productId');
    res.json({ page, limit, total, items });
  } catch(err){ next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if(!order) return res.status(404).json({ error: 'Order not found' });
    if(order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not your order' });
    res.json(order);
  } catch(err){ next(err); }
};
