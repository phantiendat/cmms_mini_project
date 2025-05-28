const { Failure, Asset } = require('../models');
const FailureService = require('../services/failure.service');

// Create a new failure
exports.create = async (req, res) => {
  try {
    const failureData = {
      ...req.body,
      status: req.body.status || 'Open'
    };
    const failure = await FailureService.create(failureData);
    res.status(201).json({
      message: "Failure created successfully",
      data: failure
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all failures
exports.getAll = async (req, res) => {
  try {
    const failures = await Failure.findAll({
      include: [{
        model: Asset,
        attributes: ['code', 'name']
      }],
      order: [['detected_at', 'DESC']]
    });
    res.status(200).json({
      message: "Failures retrieved successfully",
      data: failures
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get failures by asset id
exports.getByAsset = async (req, res) => {
  try {
    const assetId = req.params.assetId;
    const { startDate, endDate } = req.query;
    
    const failures = await FailureService.getByAsset(assetId, startDate, endDate);
    res.status(200).json({
      message: "Failures retrieved successfully",
      data: failures
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get failure by id
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const failure = await FailureService.getById(id);
    if (!failure) {
      return res.status(404).json({ message: 'Failure not found' });
    }
    res.status(200).json({
      message: "Failure retrieved successfully",
      data: failure
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update failure
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const failureData = req.body;
    
    // Giữ lại giá trị cũ nếu không có giá trị mới
    const existingFailure = await FailureService.getById(id);
    if (!existingFailure) {
      return res.status(404).json({ message: 'Failure not found' });
    }

    const updatedData = {
      ...failureData,
      status: failureData.status || existingFailure.status,
      resolved_by: failureData.resolved_by || existingFailure.resolved_by,
      reported_by: failureData.reported_by || existingFailure.reported_by
    };

    const failure = await FailureService.update(id, updatedData);
    res.status(200).json({
      message: "Failure updated successfully",
      data: failure
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete failure
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await FailureService.delete(id);
    res.status(200).json({ message: 'Failure deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
