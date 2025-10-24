
// const Order = require("../models/orderModel"); 
// const ORDER_TIMEOUT_MINUTES = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || "15");

// const checkAndExpireOrders = async () => {
//   try {
//     const now = new Date();
//     const expiryTime = new Date(now - ORDER_TIMEOUT_MINUTES * 60 * 1000);

//     const expiredOrders = await Order.updateMany(
//       { status: "Pending", createdAt: { $lt: expiryTime } },
//       { $set: { status: "Cancelled" } }
//     );

//     if (expiredOrders.modifiedCount > 0) {
//       console.log(`🕒 Cancelled ${expiredOrders.modifiedCount} unpaid orders`);
//     }
//   } catch (error) {
//     console.error("❌ Error expiring orders:", error.message);
//   }
// };

// // Run every 1 minute
// setInterval(checkAndExpireOrders, 60 * 1000);

// console.log("⏰ Expiry Worker Started...");

//
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
require('dotenv').config();

const ORDER_TIMEOUT_MINUTES = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || '1');

const checkAndExpireOrders = async () => {
  try {
    const now = new Date();
    const expiryTime = new Date(now - ORDER_TIMEOUT_MINUTES * 60 * 1000);

    const expiredOrders = await Order.find({
      status: 'PENDING_PAYMENT',
      createdAt: { $lt: expiryTime },
    });

    for (const order of expiredOrders) {
      // Release reserved stock
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { reservedStock: -item.quantity } }
        );
      }

      // Cancel the order
      order.status = 'CANCELLED';
      await order.save();
    }

    if (expiredOrders.length > 0) {
      console.log(`🕒 Cancelled ${expiredOrders.length} unpaid orders and released stock`);
    }
  } catch (error) {
    console.error('❌ Error expiring orders:', error.message);
  }
};

// Run every 1 minute
setInterval(checkAndExpireOrders, 60 * 1000);
console.log('⏰ Expiry Worker Started...');
