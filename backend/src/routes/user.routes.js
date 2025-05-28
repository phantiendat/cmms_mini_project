const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả các routes đều yêu cầu xác thực
router.use(authMiddleware.verifyToken);

// Lấy danh sách người dùng (chỉ admin)
router.get('/', authMiddleware.isAdmin, userController.findAll);

// Lấy thông tin người dùng hiện tại
router.get('/profile', userController.getProfile);

// Lấy thông tin một người dùng cụ thể (chỉ admin)
router.get('/:id', authMiddleware.isAdmin, userController.findOne);

// Cập nhật thông tin người dùng hiện tại
router.put('/profile', userController.updateProfile);

// Cập nhật thông tin người dùng (chỉ admin)
router.put('/:id', authMiddleware.isAdmin, userController.update);

// Xóa người dùng (chỉ admin)
router.delete('/:id', authMiddleware.isAdmin, userController.delete);

// Xóa tất cả người dùng (chỉ admin)
router.delete('/', authMiddleware.isAdmin, userController.deleteAll);

module.exports = router; 