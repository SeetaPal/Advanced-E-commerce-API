// const queue = require('../utils/queue');

// const processEmailJobs = async () => {
//   try {
//     const job = queue.dequeue('send_confirmation_email');
//     if(!job) return;
//     const { payload } = job;
//     console.log(`[EmailWorker] Sending confirmation email for order ${payload.orderId} to user ${payload.userId}`);
//     await new Promise(r => setTimeout(r, 500));
//     queue.complete(job.id);
//   } catch(err){
//     console.error('Email worker error', err);
//   }
// };

// setInterval(processEmailJobs, 2000);
// module.exports = { processEmailJobs };


// workers/emailWorker.js
const nodemailer = require("nodemailer");
const EventEmitter = require("events");
const emailEmitter = new EventEmitter();
require("dotenv").config();

// ✅ Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// ✅ Listen for successful payment event
emailEmitter.on("paymentSuccess", async (order) => {
  try {
    const mailOptions = {
      from: `"E-Commerce App" <${process.env.EMAIL_USER}>`,
      to: order.userEmail, // receiver email seetaofficial25@gmail.com
      subject: "Order Confirmation - Payment Successful",
      html: `
        <h2>Hi ${order.userName},</h2>
        <p>Your payment for <b>Order #${order._id}</b> was successful.</p>
        <p>We'll notify you once your order is shipped.</p>
        <br/>
        <p>Thank you for shopping with us ❤️</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${order.userEmail}`);
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error.message);
  }
});

module.exports = emailEmitter;
