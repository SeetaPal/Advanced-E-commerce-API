const Joi = require('joi');

const checkout = Joi.object({});

const pay = Joi.object({
  succeed: Joi.boolean().optional()
});

const updateStatus = Joi.object({
  status: Joi.string().valid('PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED').required()
});

const getOrders = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid('PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED').optional()
});

module.exports = { checkout, pay, updateStatus, getOrders };
