const { Employee } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, status, department } = req.query;
        const offset = (page - 1) * limit;

        // Build filter conditions
        const where = {};
        if (status) where.status = status;
        if (department) where.department = department;
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { employeeId: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Employee.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            employees: rows,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/Manager)
const createEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/Manager)
const updateEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await employee.update(req.body);
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await employee.destroy();
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get departments list
// @route   GET /api/employees/departments/list
// @access  Private
const getDepartments = async (req, res, next) => {
    try {
        const departments = await Employee.findAll({
            attributes: [[Employee.sequelize.fn('DISTINCT', Employee.sequelize.col('department')), 'department']],
            raw: true
        });

        res.json(departments.map(d => d.department).filter(Boolean));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getDepartments
};
