const express = require('express');
const router = express.Router();
const actionController = require('../controllers/action.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Create a new action
router.post('/', [authMiddleware.verifyToken, authMiddleware.isAdminOrManagerOrTechnician], actionController.create);

// Get all actions
router.get('/', authMiddleware.verifyToken, actionController.getAll);

// Get actions by asset id
router.get('/asset/:assetId', authMiddleware.verifyToken, actionController.getByAsset);

// Get action by id
router.get('/:id', authMiddleware.verifyToken, actionController.getById);

// Update action
router.put('/:id', [authMiddleware.verifyToken, authMiddleware.isAdminOrManagerOrTechnician], actionController.update);

// Delete action
router.delete('/:id', [authMiddleware.verifyToken, authMiddleware.isAdminOrManager], actionController.delete);

module.exports = router;
