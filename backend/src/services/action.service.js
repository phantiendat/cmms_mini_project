const { Action, Asset } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async () => {
  return await Action.findAll({
    include: [{
      model: Asset,
      attributes: ['code', 'name']
    }],
    order: [['performed_at', 'DESC']]
  });
};

exports.getByAsset = async (assetId, startDate, endDate) => {
  const whereClause = { asset_id: assetId };
  
  // Thêm điều kiện lọc ngày nếu có
  if (startDate && endDate) {
    whereClause.performed_at = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    whereClause.performed_at = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.performed_at = { [Op.lte]: endDate };
  }

  return await Action.findAll({
    where: whereClause,
    include: [{
      model: Asset,
      attributes: ['code', 'name']
    }],
    order: [['performed_at', 'DESC']]
  });
};

exports.getById = async (id) => {
  return await Action.findByPk(id, {
    include: [{
      model: Asset,
      attributes: ['code', 'name']
    }]
  });
};

exports.create = async (actionData) => {
  return await Action.create(actionData);
};

exports.update = async (id, actionData) => {
  const action = await Action.findByPk(id);
  if (!action) {
    throw new Error('Action not found');
  }
  return await action.update(actionData);
};

exports.delete = async (id) => {
  const action = await Action.findByPk(id);
  if (!action) {
    throw new Error('Action not found');
  }
  return await action.destroy();
}; 