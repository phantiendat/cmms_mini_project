const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../models');
const User = db.users;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  // Remove Bearer from string
  token = token.replace(/^Bearer\s+/, "");

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user.role === "admin") {
      next();
      return;
    }
    res.status(403).send({
      message: "Require Admin Role!"
    });
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

isManager = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user.role === "manager") {
      next();
      return;
    }
    res.status(403).send({
      message: "Require Manager Role!"
    });
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

isAdminOrManager = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user.role === "admin" || user.role === "manager") {
      next();
      return;
    }
    res.status(403).send({
      message: "Require Admin or Manager Role!"
    });
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

const authMiddleware = {
  verifyToken,
  isAdmin,
  isManager,
  isAdminOrManager
};

module.exports = authMiddleware; 