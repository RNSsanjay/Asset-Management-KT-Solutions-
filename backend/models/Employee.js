const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'employee_id'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false
    },
    designation: {
        type: DataTypes.STRING
    },
    contact: {
        type: DataTypes.STRING,
        validate: {
            is: /^[0-9+\-\s()]+$/i
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    branch: {
        type: DataTypes.STRING,
        defaultValue: 'Head Office'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    joiningDate: {
        type: DataTypes.DATE,
        field: 'joining_date'
    }
}, {
    timestamps: true,
    tableName: 'employees'
});

module.exports = Employee;
