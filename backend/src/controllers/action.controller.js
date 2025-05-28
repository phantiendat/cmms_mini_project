const db = require("../models");
const Action = db.Action;
const Asset = db.Asset;
const { Op } = require("sequelize");

// Create a new action
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.asset_id) {
      return res.status(400).send({
        message: "Asset ID can not be empty!"
      });
    }

    // Check if asset exists
    const asset = await Asset.findByPk(req.body.asset_id);
    if (!asset) {
      return res.status(404).send({
        message: `Asset with id ${req.body.asset_id} not found.`
      });
    }

    // Create an action
    const action = await Action.create({
      asset_id: req.body.asset_id,
      type: req.body.type,
      description: req.body.description,
      status: req.body.status || "Planned",
      performed_by: req.body.performed_by,
      performed_at: req.body.performed_at,
      created_by: req.body.created_by,
      severity: req.body.severity || "medium",
      custom_fields: req.body.custom_fields || {}
    });

    res.status(201).json({
      message: "Action created successfully",
      data: action
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while creating the action."
    });
  }
};

// Get all actions
exports.getAll = async (req, res) => {
  try {
    const actions = await Action.findAll({
      include: [{
        model: Asset,
        attributes: ['code', 'name']
      }]
    });
    res.status(200).json({
      message: "Actions retrieved successfully",
      data: actions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get actions by asset id
exports.getByAsset = async (req, res) => {
  try {
    const assetId = req.params.assetId;
    const { startDate, endDate } = req.query;
    
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

    const actions = await Action.findAll({
      where: whereClause,
      order: [['performed_at', 'DESC']]
    });
    
    res.status(200).json(actions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get action by id
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const action = await Action.findByPk(id, {
      include: [{
        model: Asset,
        attributes: ['code', 'name']
      }]
    });
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }
    res.status(200).json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an action
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const action = await Action.findByPk(id);
    if (!action) {
      return res.status(404).send({
        message: `Action with id ${id} not found.`
      });
    }

    // Update action
    await action.update({
      type: req.body.type || action.type,
      description: req.body.description || action.description,
      status: req.body.status || action.status,
      performed_by: req.body.performed_by || action.performed_by,
      performed_at: req.body.performed_at || action.performed_at,
      created_by: req.body.created_by || action.created_by,
      severity: req.body.severity || action.severity,
      custom_fields: req.body.custom_fields || action.custom_fields
    });

    res.status(200).json(action);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while updating the action."
    });
  }
};

// Delete action
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Action.destroy({
      where: { id: id }
    });
    res.status(200).json({ message: 'Action deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
