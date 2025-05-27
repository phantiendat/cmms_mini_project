const { Document } = require('../models');
const path = require('path');

// Upload tài liệu
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Tạo đường dẫn tương đối để lưu vào database
    const filePath = `/uploads/documents/${path.basename(req.file.path)}`;

    // Tạo bản ghi tài liệu mới
    const document = await Document.create({
      asset_id: req.body.asset_id,
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'other',
      file_path: filePath,
      uploaded_at: new Date()
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả tài liệu của một tài sản
exports.getDocumentsByAsset = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: {
        asset_id: req.params.assetId
      }
    });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa tài liệu
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.destroy();
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
