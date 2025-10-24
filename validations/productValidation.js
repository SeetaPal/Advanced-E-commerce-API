const Joi = require('joi');

exports.create = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().allow(''),
  totalStock: Joi.number().integer().min(0).required()
});

exports.update = Joi.object({
  name: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  description: Joi.string().allow('').optional(),
  totalStock: Joi.number().integer().min(0).optional()
});
