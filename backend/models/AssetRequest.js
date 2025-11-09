const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AssetRequest = sequelize.define('AssetRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'employee_id'
    },
    requestedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'requested_by'
    },
    categoryId: {
        type: DataTypes.UUID,
        field: 'category_id'
    },
    assetType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'asset_type'
    },
    justification: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
        defaultValue: 'Medium'
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Fulfilled'),
        defaultValue: 'Pending'
    },
    requestDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'request_date'
    },
    reviewedBy: {
        type: DataTypes.UUID,
        field: 'reviewed_by'
    },
    reviewDate: {
        type: DataTypes.DATE,
        field: 'review_date'
    },
    reviewNotes: {
        type: DataTypes.TEXT,
        field: 'review_notes'
    },
    assignedAssetId: {
        type: DataTypes.UUID,
        field: 'assigned_asset_id'
    }
}, {
    timestamps: true,
    tableName: 'asset_requests'
});

module.exports = AssetRequest;
