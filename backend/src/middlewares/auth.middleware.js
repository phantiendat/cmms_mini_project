const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const { User } = require('../models');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token.replace('Bearer ', ''), config.secret);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // Check if user exists and is active
    const user = await User.findByPk(req.userId);
    if (!user || !user.active) {
      return res.status(403).json({ message: 'User not found or inactive' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Require Admin Role' });
  }
  next();
};

// Check if user is admin or manager
const isAdminOrManager = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'manager') {
    return res.status(403).json({ message: 'Require Admin or Manager Role' });
  }
  next();
};

// Check if user is admin, manager or technician
const isAdminOrManagerOrTechnician = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'manager' && req.userRole !== 'technician') {
    return res.status(403).json({ message: 'Require Admin, Manager or Technician Role' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isAdminOrManager,
  isAdminOrManagerOrTechnician
};
