const db = require('../models');
const { Op } = require('sequelize');
const Asset = db.assets;
const AssetService = require('../services/asset.service');

// Create a new asset
exports.create = async (req, res) => {
  try {
    const asset = await AssetService.create(req.body);
    res.status(201).json({
      message: "Asset created successfully",
      data: asset
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the asset."
    });
  }
};

// Get all assets
exports.findAll = async (req, res) => {
  try {
    const { includeCounts, startDate, endDate } = req.query;
    let assets;

    if (includeCounts === 'true') {
      assets = await AssetService.getAllWithCounts(startDate, endDate);
    } else {
      assets = await AssetService.getAll();
    }

    res.json({
      message: "Assets retrieved successfully",
      data: assets
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving assets."
    });
  }
};

// Get asset by id
exports.findOne = async (req, res) => {
  try {
    const asset = await AssetService.get(req.params.id);
    if (!asset) {
      return res.status(404).json({
        message: `Asset with id ${req.params.id} not found.`
      });
    }
    res.json({
      message: "Asset retrieved successfully",
      data: asset
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving asset with id ${req.params.id}`
    });
  }
};

// Update asset
exports.update = async (req, res) => {
  try {
    const asset = await AssetService.update(req.params.id, req.body);
    if (!asset) {
      return res.status(404).json({
        message: `Asset with id ${req.params.id} not found.`
      });
    }
    res.json({
      message: "Asset updated successfully",
      data: asset
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating asset with id ${req.params.id}`
    });
  }
};

// Delete asset
exports.delete = async (req, res) => {
  try {
    const result = await AssetService.delete(req.params.id);
    if (!result) {
      return res.status(404).json({
        message: `Asset with id ${req.params.id} not found.`
      });
    }
    res.json({
      message: "Asset deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error deleting asset with id ${req.params.id}`
    });
  }
};

// Delete all assets
exports.deleteAll = async (req, res) => {
  try {
    await AssetService.deleteAll();
    res.json({
      message: "All assets deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while removing all assets."
    });
  }
};

// Get asset health report
exports.findAssetHealth = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date format
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        message: "Invalid startDate format. Use YYYY-MM-DD"
      });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        message: "Invalid endDate format. Use YYYY-MM-DD"
      });
    }

    const assets = await AssetService.getAllWithCounts(startDate, endDate);
    
    if (!assets || assets.length === 0) {
      return res.json({
        message: "No assets found for the specified criteria",
        data: []
      });
    }

    res.json({
      message: "Asset health report generated successfully",
      data: assets
    });
  } catch (err) {
    console.error("Error in findAssetHealth:", err);
    res.status(500).json({
      message: err.message || "Some error occurred while generating asset health report."
    });
  }
};

// Helper function to validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}
