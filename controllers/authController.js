const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { register: regSchema, login: loginSchema } = require('../validations/authValidation');

exports.register = async (req, res, next) => {
  try {
    const { error, value } = regSchema.validate(req.body);
    if(error) return res.status(400).json({ error: error.message });
    const existing = await User.findOne({ email: value.email });
    if(existing) return res.status(400).json({ error: 'Email already used' });
    const user = await User.create(value);
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) { next(err); }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if(!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch(err) {
    next(err);
  }
};