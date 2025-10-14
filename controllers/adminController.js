const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const { parsePagination } = require('../utils/pagination');

exports.listOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter = {};
    if(req.query.status) filter.status = req.query.status;
    if(req.query.userId) filter.userId = req.query.userId;
    const total = await Order.countDocuments(filter);
    const items = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('items.productId');
    res.json({ page, limit, total, items });
  } catch(err){ next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if(!['SHIPPED','DELIVERED','CANCELLED'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const order = await Order.findById(id);
    if(!order) return res.status(404).json({ error: 'Order not found' });

    if(status === 'CANCELLED' && order.status === 'PAID') {
      for(const item of order.items){
        await Product.updateOne({ _id: item.productId }, { $inc: { totalStock: item.quantity } });
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch(err){
    next(err);
  }
};

