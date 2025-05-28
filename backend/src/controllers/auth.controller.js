const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/auth.config');

// Register a new user
exports.register = async (req, res) => {
  try {
    // Thêm dòng log ở đây, bên trong phương thức
    console.log('Register request:', req.body);
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const user = await User.create({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || 'viewer'
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    // Find user by username
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, config.secret, {
      expiresIn: config.jwtExpiration
    });

    console.log('Login successful for user:', req.body.username);
    console.log('User role:', user.role);
    
    // Return user information and token
    res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};


