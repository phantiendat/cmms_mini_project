const express = require('express');
const router = express.Router();
const failureController = require('../controllers/failure.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/failures
router.get('/', authMiddleware.verifyToken, failureController.getAll);

// GET /api/failures/:id
router.get('/:id', authMiddleware.verifyToken, failureController.getById);

// GET /api/failures/asset/:assetId
router.get('/asset/:assetId', authMiddleware.verifyToken, failureController.getByAsset);

// POST /api/failures
router.post('/', authMiddleware.verifyToken, failureController.create);

// PUT /api/failures/:id
router.put('/:id', authMiddleware.verifyToken, failureController.update);

// DELETE /api/failures/:id
router.delete('/:id', authMiddleware.verifyToken, failureController.delete);

module.exports = router;
