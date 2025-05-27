const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRequest, registerSchema, loginSchema } = require('../utils/validation');

// Register a new user
router.post('/register', validateRequest(registerSchema), authController.register);

// Login user
router.post('/login', validateRequest(loginSchema), authController.login);

module.exports = router;

