const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('USER', 'ADMIN') // Add this line
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { register, login };
