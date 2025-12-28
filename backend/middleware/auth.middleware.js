const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ethers } = require('ethers');

// General-purpose middleware for verifying token
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized!' });
    }
   req.user = {
      id: decoded.userId,      // ✅ Map token's userId to id
      role: decoded.role,
      email: decoded.email
    };
    next();
  });
};

// Middleware to check if the user is a doctor
const requireDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied: Doctors only' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', details: err.message });
  }
};

// Alternate name for verifyToken if needed elsewhere
const protect = verifyToken;

// Export all
module.exports = {
  verifyToken,
  requireDoctor,
  protect,
};
