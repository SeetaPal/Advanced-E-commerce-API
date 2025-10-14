const Product = require('../models/productModel');
const Joi = require('joi');
const { parsePagination } = require('../utils/pagination');

const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().allow(''),
  totalStock: Joi.number().integer().min(0).required()
});

exports.create = async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if(error) return res.status(400).json({ error: error.message });
    const p = await Product.create(value);
    res.status(201).json(p);
  } catch(err){ next(err); }
};


exports.update = async (req, res, next) => {
  try {
    const updates = req.body;   
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// exports.remove = async (req, res, next) => {
//   try {
//     const p = await Product.findByIdAndDelete(req.params.id);
//     if(!p) return res.status(404).json({ error: 'Product not found' });
//     res.status(204).send();
//   } catch(err){ next(err); }
// };

exports.remove = async (req, res, next) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully', product: p });
  } catch (err) {
    next(err);
  }
};





exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);

    const filter = {};

    if (req.query.name) {
      filter.name = new RegExp(req.query.name, "i");
    }

    if (req.query.price) {
      filter.price = Number(req.query.price); 
    } else if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    
    let sort = {};
    if (req.query.sortBy) {
      const [field, dir] = req.query.sortBy.split(":");
      sort[field] = dir === "desc" ? -1 : 1;
    } else {
      sort = { createdAt: -1 }; 
    }

    const total = await Product.countDocuments(filter);
    const items = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ page, limit, total, items });
  } catch (err) {
    next(err);
  }
};