const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getDepartments
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const employeeValidation = [
    body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department').trim().notEmpty().withMessage('Department is required')
];

// Apply authentication to all routes
router.use(protect);

router.get('/departments/list', getDepartments);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('Admin', 'Manager'), employeeValidation, createEmployee);
router.put('/:id', authorize('Admin', 'Manager'), updateEmployee);
router.delete('/:id', authorize('Admin'), deleteEmployee);

module.exports = router;
