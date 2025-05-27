const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

// Lấy danh sách tất cả người dùng
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({
      message: 'Lấy danh sách người dùng thành công',
      data: users
    });
  } catch (error) {
    logger.error('Error in findAll:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách người dùng',
      error: error.message
    });
  }
};

// Lấy thông tin người dùng hiện tại
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng'
      });
    }
    res.json({
      message: 'Lấy thông tin người dùng thành công',
      data: user
    });
  } catch (error) {
    logger.error('Error in getProfile:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

// Lấy thông tin một người dùng cụ thể
exports.findOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng'
      });
    }
    res.json({
      message: 'Lấy thông tin người dùng thành công',
      data: user
    });
  } catch (error) {
    logger.error('Error in findOne:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

// Cập nhật thông tin người dùng hiện tại
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng'
      });
    }

    // Cập nhật thông tin cơ bản
    const { username, email, fullName, phone } = req.body;
    await user.update({
      username: username || user.username,
      email: email || user.email,
      fullName: fullName || user.fullName,
      phone: phone || user.phone
    });

    // Nếu có cập nhật mật khẩu
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await user.update({ password: hashedPassword });
    }

    res.json({
      message: 'Cập nhật thông tin thành công',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error in updateProfile:', error);
    res.status(500).json({
      message: 'Lỗi khi cập nhật thông tin người dùng',
      error: error.message
    });
  }
};

// Cập nhật thông tin người dùng (admin)
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng'
      });
    }

    // Cập nhật thông tin
    const { username, email, fullName, phone, role } = req.body;
    await user.update({
      username: username || user.username,
      email: email || user.email,
      fullName: fullName || user.fullName,
      phone: phone || user.phone,
      role: role || user.role
    });

    // Nếu có cập nhật mật khẩu
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await user.update({ password: hashedPassword });
    }

    res.json({
      message: 'Cập nhật thông tin người dùng thành công',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error in update:', error);
    res.status(500).json({
      message: 'Lỗi khi cập nhật thông tin người dùng',
      error: error.message
    });
  }
};

// Xóa người dùng
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng'
      });
    }

    await user.destroy();
    res.json({
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    logger.error('Error in delete:', error);
    res.status(500).json({
      message: 'Lỗi khi xóa người dùng',
      error: error.message
    });
  }
};

// Xóa tất cả người dùng
exports.deleteAll = async (req, res) => {
  try {
    await User.destroy({
      where: {},
      truncate: false
    });
    res.json({
      message: 'Xóa tất cả người dùng thành công'
    });
  } catch (error) {
    logger.error('Error in deleteAll:', error);
    res.status(500).json({
      message: 'Lỗi khi xóa tất cả người dùng',
      error: error.message
    });
  }
}; 