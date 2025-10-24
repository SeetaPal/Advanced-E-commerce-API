const nodemailer = require("nodemailer");
const EventEmitter = require("events");
const emailEmitter = new EventEmitter();
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Payment Success Email
emailEmitter.on("paymentSuccess", async (order) => {
  try {
    const mailOptions = {
      from: `"E-Commerce App" <${process.env.EMAIL_USER}>`,
      to: order.userEmail,
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
    console.error("❌ Error sending success email:", error.message);
  }
});

// ❌ Payment Failed Email
emailEmitter.on("paymentFailed", async (order) => {
  try {
    const mailOptions = {
      from: `"E-Commerce App" <${process.env.EMAIL_USER}>`,
      to: order.userEmail,
      subject: "Order Cancelled - Payment Failed",
      html: `
        <h2>Hi ${order.userName},</h2>
        <p>Unfortunately, your payment for <b>Order #${order._id}</b> failed.</p>
        <p>The reserved items have been released back to stock.</p>
        <p>You can try again anytime.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`⚠️ Failure email sent to ${order.userEmail}`);
  } catch (error) {
    console.error("❌ Error sending failure email:", error.message);
  }
});

// 🕒 Payment Timeout Email
emailEmitter.on("paymentTimeout", async (order) => {
  try {
    const mailOptions = {
      from: `"E-Commerce App" <${process.env.EMAIL_USER}>`,
      to: order.userEmail,
      subject: "Order Cancelled - Payment Timeout",
      html: `
        <h2>Hi ${order.userName},</h2>
        <p>Your order <b>#${order._id}</b> has been cancelled because payment was not completed within time.</p>
        <p>The reserved stock has been released.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📨 Timeout email sent to ${order.userEmail}`);
  } catch (error) {
    console.error("❌ Error sending timeout email:", error.message);
  }
});

module.exports = emailEmitter;
