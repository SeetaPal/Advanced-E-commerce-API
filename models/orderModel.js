const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING_PAYMENT','PAID','SHIPPED','DELIVERED','CANCELLED'],
    default: 'PENDING_PAYMENT'
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
