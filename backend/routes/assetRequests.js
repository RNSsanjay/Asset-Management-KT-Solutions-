const express = require('express');
const router = express.Router();
const assetRequestController = require('../controllers/assetRequestController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get pending requests count (Admin/Manager)
router.get('/pending/count',
    authorize(['Admin', 'Manager']),
    assetRequestController.getPendingCount
);

// Create new request (Employee only)
router.post('/',
    authorize(['Employee']),
    assetRequestController.createRequest
);

// Get all requests (role-based filtering in controller)
router.get('/', assetRequestController.getAllRequests);

// Review request (Admin/Manager only)
router.patch('/:id/review',
    authorize(['Admin', 'Manager']),
    assetRequestController.reviewRequest
);

// Get single request
router.get('/:id', assetRequestController.getRequestById);

// Delete request
router.delete('/:id', assetRequestController.deleteRequest);

module.exports = router;
