const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Joi = require('joi');

const itemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required()
});

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if(!cart) { cart = await Cart.create({ userId: req.user._id }); }
    res.json(cart);
  } catch(err){ next(err); }
};

exports.addOrUpdateItem = async (req, res, next) => {
  try {
    const { error, value } = itemSchema.validate(req.body);
    if(error) return res.status(400).json({ error: error.message });
    const product = await Product.findById(value.productId);
    if(!product) return res.status(404).json({ error: 'Product not found' });
    // keep cart independent — availability checked at checkout
    let cart = await Cart.findOne({ userId: req.user._id });
    if(!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
    const idx = cart.items.findIndex(i => i.productId.toString() === value.productId);
    if(idx === -1) cart.items.push({ productId: value.productId, quantity: value.quantity });
    else cart.items[idx].quantity = value.quantity;
    await cart.save();
    res.json(cart);
  } catch(err){ next(err); }
};

exports.removeItem = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    let cart = await Cart.findOne({ userId: req.user._id });
    if(!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch(err){ next(err); }
};
