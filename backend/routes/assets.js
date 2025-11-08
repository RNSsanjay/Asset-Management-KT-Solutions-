const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    getStockSummary
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation rules
const assetValidation = [
    body('assetTag').trim().notEmpty().withMessage('Asset tag is required'),
    body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('make').trim().notEmpty().withMessage('Make is required'),
    body('model').trim().notEmpty().withMessage('Model is required')
];

// Apply authentication to all routes
router.use(protect);

router.get('/stock/summary', getStockSummary);
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorize('Admin', 'Manager'), upload.single('image'), assetValidation, createAsset);
router.put('/:id', authorize('Admin', 'Manager'), upload.single('image'), updateAsset);
router.delete('/:id', authorize('Admin'), deleteAsset);

module.exports = router;
