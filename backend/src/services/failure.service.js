const { Failure, Asset } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async () => {
  return await Failure.findAll({
    include: [{
      model: Asset,
      attributes: ['code', 'name']
    }],
    order: [['detected_at', 'DESC']]
  });
};

exports.getByAsset = async (assetId, startDate, endDate) => {
  const whereClause = { asset_id: assetId };
  
  // Thêm điều kiện lọc ngày nếu có
  if (startDate && endDate) {
    whereClause.detected_at = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    whereClause.detected_at = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.detected_at = { [Op.lte]: endDate };
  }

  return await Failure.findAll({
    where: whereClause,
    include: [{
      model: Asset,
      attributes: ['code', 'name']
    }],
    order: [['detected_at', 'DESC']]
  });
};

exports.getById = async (id) => {
  return await Failure.findByPk(id, {
    include: [{
      model: Asset,
      attributes: ['code', 'name']
    }]
  });
};

exports.create = async (failureData) => {
  return await Failure.create(failureData);
};

exports.update = async (id, failureData) => {
  const failure = await Failure.findByPk(id);
  if (!failure) {
    throw new Error('Failure not found');
  }
  return await failure.update(failureData);
};

exports.delete = async (id) => {
  const failure = await Failure.findByPk(id);
  if (!failure) {
    throw new Error('Failure not found');
  }
  return await failure.destroy();
}; 