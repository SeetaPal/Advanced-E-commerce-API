const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, index: true, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  totalStock: { type: Number, required: true, min: 0 },
  reservedStock: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

ProductSchema.virtual('availableStock').get(function(){
  return this.totalStock - this.reservedStock;
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
