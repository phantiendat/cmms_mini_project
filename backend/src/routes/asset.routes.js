const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả các routes đều yêu cầu xác thực
router.use(authMiddleware.verifyToken);

// Lấy danh sách assets
router.get('/', assetController.findAll);

// Lấy báo cáo sức khỏe tài sản
router.get('/health', assetController.findAssetHealth);

// Lấy chi tiết một asset
router.get('/:id', assetController.findOne);

// Tạo asset mới (yêu cầu quyền admin hoặc manager)
router.post('/', authMiddleware.isAdminOrManager, assetController.create);

// Cập nhật asset (yêu cầu quyền admin hoặc manager)
router.put('/:id', authMiddleware.isAdminOrManager, assetController.update);

// Xóa asset (yêu cầu quyền admin)
router.delete('/:id', authMiddleware.isAdmin, assetController.delete);

// Xóa tất cả assets (yêu cầu quyền admin)
router.delete('/', authMiddleware.isAdmin, assetController.deleteAll);

module.exports = router;
