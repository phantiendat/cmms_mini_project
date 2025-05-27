const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { uploadDocument } = require('../middlewares/upload.middleware');

// Upload tài liệu
router.post('/upload', (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, documentController.uploadDocument);

// Lấy tất cả tài liệu của một tài sản
router.get('/asset/:assetId', documentController.getDocumentsByAsset);

// Xóa tài liệu
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
