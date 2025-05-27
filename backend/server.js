const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./src/config/db.config');
const bcrypt = require('bcryptjs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger, requestLogger, errorLogger } = require('./src/utils/logger');
const bodyParser = require('body-parser');
const db = require('./src/models');

// Load environment variables
dotenv.config();
logger.info('Environment variables loaded');
logger.debug('DB_USER:', process.env.DB_USER);
logger.debug('DB_NAME:', process.env.DB_NAME);
logger.debug('DB_HOST:', process.env.DB_HOST);

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(requestLogger); // Thêm middleware log request

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Cấu hình rate limiting với giới hạn cao hơn
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 1000, // Tăng giới hạn lên 1000 request
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after an hour'
  }
});

// Áp dụng rate limiting cho tất cả các routes
app.use('/api', apiLimiter);

// Cấu hình rate limiting cho route đăng nhập
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 20, // Tăng giới hạn lên 20 lần đăng nhập trong 1 giờ
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP, please try again after an hour'
  }
});

// Áp dụng rate limiting cho route đăng nhập
app.use('/api/auth/login', loginLimiter);

// Routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const assetRoutes = require('./src/routes/asset.routes');
const actionRoutes = require('./src/routes/action.routes');
const failureRoutes = require('./src/routes/failure.routes');
const documentRoutes = require('./src/routes/document.routes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/failures', failureRoutes);
app.use('/api/documents', documentRoutes);

// Phục vụ file tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CMMS Mini Project API.' });
});

// Error handling middleware
app.use(errorLogger); // Thêm middleware log lỗi
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Set port and start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    // Sync database (in development)
    await sequelize.sync(); // Chỉ tạo bảng nếu chưa tồn tại, không thay đổi bảng đã có
    logger.info('Database synchronized');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});

// Development test routes - Remove in production
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.post('/api/test-post', (req, res) => {
  logger.debug('Received POST data:', req.body);
  res.json({ message: 'POST request received', data: req.body });
});

// Database connection
db.sequelize.sync()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

