const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try{
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
    const parts = authHeader.split(' ');
    if(parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
    const token = parts[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  }catch(err){
    next(err);
  }
};

module.exports = authMiddleware;
