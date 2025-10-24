
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
