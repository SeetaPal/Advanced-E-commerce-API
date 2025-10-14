// const mongoose = require('mongoose');
// const Order = require('../models/orderModel');
// const Product = require('../models/productModel');
// const ORDER_TIMEOUT_MIN = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || '15', 10);

// const checkAndExpireOrders = async () => {
//   const cutoff = new Date(Date.now() - ORDER_TIMEOUT_MIN * 60 * 1000);
//   const stale = await Order.find({ status: 'PENDING_PAYMENT', createdAt: { $lt: cutoff } });
//   for(const order of stale){
//     const session = await mongoose.startSession();
//     try {
//       session.startTransaction();
//       const fresh = await Order.findById(order._id).session(session);
//       if(!fresh || fresh.status !== 'PENDING_PAYMENT') { await session.abortTransaction(); continue; }

//       for(const item of fresh.items){
//         await Product.updateOne({ _id: item.productId }, { $inc: { reservedStock: -item.quantity } }).session(session);
//       }

//       fresh.status = 'CANCELLED';
//       await fresh.save({ session });
//       await session.commitTransaction();
//       console.log(`Order ${fresh._id} expired and cancelled`);
//     } catch(err){
//       await session.abortTransaction();
//       console.error('Error expiring order', err);
//     } finally {
//       session.endSession();
//     }
//   }
// };

// setInterval(checkAndExpireOrders, 60 * 1000);
// module.exports = { checkAndExpireOrders };

const Order = require("../models/orderModel"); 
const ORDER_TIMEOUT_MINUTES = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || "15");

const checkAndExpireOrders = async () => {
  try {
    const now = new Date();
    const expiryTime = new Date(now - ORDER_TIMEOUT_MINUTES * 60 * 1000);

    const expiredOrders = await Order.updateMany(
      { status: "Pending", createdAt: { $lt: expiryTime } },
      { $set: { status: "Cancelled" } }
    );

    if (expiredOrders.modifiedCount > 0) {
      console.log(`🕒 Cancelled ${expiredOrders.modifiedCount} unpaid orders`);
    }
  } catch (error) {
    console.error("❌ Error expiring orders:", error.message);
  }
};

// Run every 1 minute
setInterval(checkAndExpireOrders, 60 * 1000);

console.log("⏰ Expiry Worker Started...");