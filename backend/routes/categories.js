const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const categoryValidation = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('code').trim().notEmpty().withMessage('Category code is required')
        .isLength({ min: 2, max: 10 }).withMessage('Code must be between 2-10 characters')
];

// Apply authentication to all routes
router.use(protect);

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authorize('Admin', 'Manager'), categoryValidation, createCategory);
router.put('/:id', authorize('Admin', 'Manager'), updateCategory);
router.delete('/:id', authorize('Admin'), deleteCategory);

module.exports = router;
