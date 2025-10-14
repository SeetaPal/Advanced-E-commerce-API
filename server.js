
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorMiddleware');

// const emailWorker = require('./workers/emailWorker'); // starts automatically
// const expiryWorker = require('./workers/expiryWorker'); // starts automatically

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const start = async () => {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
};

start().catch(err => {
  console.error('Failed to start', err);
  process.exit(1);
});
