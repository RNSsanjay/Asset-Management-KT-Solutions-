const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AssetHistory = sequelize.define('AssetHistory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    assetId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'asset_id'
    },
    employeeId: {
        type: DataTypes.UUID,
        field: 'employee_id'
    },
    action: {
        type: DataTypes.ENUM('Purchase', 'Issue', 'Return', 'Repair', 'Scrap', 'Transfer'),
        allowNull: false
    },
    actionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'action_date'
    },
    condition: {
        type: DataTypes.ENUM('Excellent', 'Good', 'Fair', 'Poor')
    },
    reason: {
        type: DataTypes.TEXT
    },
    performedBy: {
        type: DataTypes.UUID,
        field: 'performed_by'
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    tableName: 'asset_history'
});

module.exports = AssetHistory;
