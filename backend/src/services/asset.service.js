const { Asset, Action, Failure } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');

class AssetService {
  async getAll() {
    return await Asset.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  async getAllWithCounts(startDate, endDate) {
    try {
      const actionWhere = {};
      const failureWhere = {};

      if (startDate && endDate) {
        actionWhere.performed_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
        failureWhere.detected_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const assets = await Asset.findAll({
        attributes: {
          include: [
            [
              db.sequelize.literal(`(
                SELECT COUNT(*)
                FROM actions
                WHERE actions.asset_id = Asset.id
                ${Object.keys(actionWhere).length ? 'AND ' + Object.entries(actionWhere).map(([key, value]) => 
                  `actions.${key} ${value[Op.between] ? 'BETWEEN' : '='} '${value[Op.between] ? value[Op.between].join("' AND '") : value}'`
                ).join(' AND ') : ''}
              )`),
              'actions_count'
            ],
            [
              db.sequelize.literal(`(
                SELECT COUNT(*)
                FROM failures
                WHERE failures.asset_id = Asset.id
                ${Object.keys(failureWhere).length ? 'AND ' + Object.entries(failureWhere).map(([key, value]) => 
                  `failures.${key} ${value[Op.between] ? 'BETWEEN' : '='} '${value[Op.between] ? value[Op.between].join("' AND '") : value}'`
                ).join(' AND ') : ''}
              )`),
              'failures_count'
            ]
          ]
        },
        order: [['created_at', 'DESC']]
      });

      return assets.map(asset => asset.get({ plain: true }));
    } catch (error) {
      console.error('Error in getAllWithCounts:', error);
      throw error;
    }
  }

  async get(id) {
    return await Asset.findByPk(id, {
      include: [
        { model: Action },
        { model: Failure }
      ]
    });
  }

  async create(data) {
    return await Asset.create({
      code: data.code,
      name: data.name,
      location: data.location,
      system: data.system,
      specifications: data.specifications || '',
      custom_fields: data.custom_fields || {}
    });
  }

  async update(id, data) {
    const asset = await Asset.findByPk(id);
    if (!asset) return null;

    return await asset.update({
      code: data.code || asset.code,
      name: data.name || asset.name,
      location: data.location || asset.location,
      system: data.system || asset.system,
      specifications: data.specifications || asset.specifications,
      custom_fields: data.custom_fields || asset.custom_fields
    });
  }

  async delete(id) {
    const asset = await Asset.findByPk(id);
    if (!asset) return false;

    await asset.destroy();
    return true;
  }

  async deleteAll() {
    return await Asset.destroy({
      where: {},
      truncate: false
    });
  }
}

module.exports = new AssetService(); 