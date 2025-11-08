const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    issueAsset,
    returnAsset,
    scrapAsset,
    getAssetHistory,
    getAssetTimeline,
    generatePDFReport
} = require('../controllers/assetHistoryController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const issueValidation = [
    body('assetId').notEmpty().withMessage('Asset ID is required'),
    body('employeeId').notEmpty().withMessage('Employee ID is required')
];

const returnValidation = [
    body('assetId').notEmpty().withMessage('Asset ID is required'),
    body('condition').notEmpty().withMessage('Condition is required')
];

const scrapValidation = [
    body('assetId').notEmpty().withMessage('Asset ID is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required')
];

// Apply authentication to all routes
router.use(protect);

router.get('/', getAssetHistory);
router.get('/timeline/:assetId', getAssetTimeline);
router.get('/report/pdf', generatePDFReport);
router.post('/issue', authorize('Admin', 'Manager'), issueValidation, issueAsset);
router.post('/return', authorize('Admin', 'Manager'), returnValidation, returnAsset);
router.post('/scrap', authorize('Admin'), scrapValidation, scrapAsset);

module.exports = router;
