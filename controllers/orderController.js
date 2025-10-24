// const mongoose = require('mongoose');
// const Order = require('../models/orderModel');
// const Product = require('../models/productModel');
// const Cart = require('../models/cartModel');
// const Payment = require('../models/paymentModel');
// const queue = require('../utils/queue');

// const Joi = require('joi');

// const checkoutSchema = Joi.object({ }); 



// exports.checkout = async (req, res, next) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user._id });
//     if(!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart empty' });

//     const productIds = cart.items.map(i => i.productId);
//     const products = await Product.find({ _id: { $in: productIds } });

//     const productMap = new Map(products.map(p => [p._id.toString(), p]));
//     const orderItems = [];
//     let totalAmount = 0;

//     for(const ci of cart.items){
//       const prod = productMap.get(ci.productId.toString());
//       if(!prod) return res.status(400).json({ error: `Product ${ci.productId} not found` });
//       const available = prod.totalStock - prod.reservedStock;
//       if(available < ci.quantity) return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });

//       orderItems.push({
//         productId: prod._id,
//         quantity: ci.quantity,
//         priceAtPurchase: prod.price
//       });
//       prod.reservedStock += ci.quantity;
//       totalAmount += prod.price * ci.quantity;
//       await prod.save();
//     }

//     const order = await Order.create({
//       userId: req.user._id,
//       items: orderItems,
//       totalAmount,
//       status: 'PENDING_PAYMENT'
//     });

//     cart.items = [];
//     await cart.save();

//     res.status(201).json(order);
//   } catch(err){
//     next(err);
//   }
// };


// exports.pay = async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const userId = req.user.id;
//     const { succeed = true } = req.body; // simulate success/failure

//     const order = await Order.findOne({ _id: orderId, userId });
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     if (order.status !== 'PENDING_PAYMENT') {
//       return res.status(400).json({ message: 'Order cannot be paid again' });
//     }

//     const payment = new Payment({
//       orderId: order._id,
//       transactionId: `txn_${Date.now()}`,
//       amount: order.totalAmount,
//       status: succeed ? 'SUCCESS' : 'FAILED',
//     });

//     await payment.save();

//     if (succeed) {
//       order.status = 'PAID';
//       order.paidAt = new Date();
//       await order.save();

//       res.status(200).json({ message: 'Payment successful', order });
//     } else {
//       // Payment failed → release stock immediately
//       for (const item of order.items) {
//         await Product.updateOne(
//           { _id: item.productId },
//           { $inc: { reservedStock: -item.quantity } }
//         );
//       }
//       order.status = 'CANCELLED';
//       await order.save();

//       res.status(400).json({ message: 'Payment failed, order cancelled' });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getOrders = async (req, res, next) => {
//   try {
//     const { page, limit, skip } = require('../utils/pagination').parsePagination(req);
//     const filter = { userId: req.user._id };
//     if(req.query.status) filter.status = req.query.status;
//     const total = await Order.countDocuments(filter);
//     const items = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('items.productId');
//     res.json({ page, limit, total, items });
//   } catch(err){ next(err); }
// };

// exports.getOrder = async (req, res, next) => {
//   try {
//     const order = await Order.findById(req.params.id).populate('items.productId');
//     if(!order) return res.status(404).json({ error: 'Order not found' });
//     if(order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not your order' });
//     res.json(order);
//   } catch(err){ next(err); }
// };



///////////////////////////////////
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Payment = require('../models/paymentModel');
const emailEmitter = require('../utils/emailEmitter');
const Joi = require('joi');


exports.checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ error: 'Cart empty' });

    const productIds = cart.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    const orderItems = [];
    let totalAmount = 0;

    for (const ci of cart.items) {
      const prod = productMap.get(ci.productId.toString());
      if (!prod)
        return res.status(400).json({ error: `Product ${ci.productId} not found` });
      const available = prod.totalStock - prod.reservedStock;
      if (available < ci.quantity)
        return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });

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
      userName: req.user.name,
      userEmail: req.user.email,
      items: orderItems,
      totalAmount,
      status: 'PENDING_PAYMENT'
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// ---------------- PAYMENT CONTROLLER ----------------
exports.pay = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { succeed = true } = req.body; 

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ message: 'Order cannot be paid again' });
    }

    const payment = new Payment({
      orderId: order._id,
      transactionId: `txn_${Date.now()}`,
      amount: order.totalAmount,
      status: succeed ? 'SUCCESS' : 'FAILED',
    });

    await payment.save();

    if (succeed) {
      order.status = 'PAID';
      order.paidAt = new Date();
      await order.save();

      // ✅ Emit success email
      emailEmitter.emit('paymentSuccess', order);

      res.status(200).json({ message: 'Payment successful', order });
    } else {
      // ❌ Payment failed → release stock immediately
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { reservedStock: -item.quantity } }
        );
      }
      order.status = 'CANCELLED';
      await order.save();

      emailEmitter.emit('paymentFailed', order);

      res.status(400).json({ message: 'Payment failed, order cancelled' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = require('../utils/pagination').parsePagination(req);
    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const total = await Order.countDocuments(filter);
    const items = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId');
    res.json({ page, limit, total, items });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not your order' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
