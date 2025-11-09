const User = require('./User');
const Employee = require('./Employee');
const Category = require('./Category');
const Asset = require('./Asset');
const AssetHistory = require('./AssetHistory');
const AssetRequest = require('./AssetRequest');

// Define associations
// Category -> Asset (One to Many)
Category.hasMany(Asset, {
    foreignKey: 'categoryId',
    as: 'assets',
    onDelete: 'RESTRICT'
});
Asset.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// Asset -> AssetHistory (One to Many)
Asset.hasMany(AssetHistory, {
    foreignKey: 'assetId',
    as: 'history',
    onDelete: 'CASCADE'
});
AssetHistory.belongsTo(Asset, {
    foreignKey: 'assetId',
    as: 'asset'
});

// Employee -> AssetHistory (One to Many)
Employee.hasMany(AssetHistory, {
    foreignKey: 'employeeId',
    as: 'assetHistory',
    onDelete: 'SET NULL'
});
AssetHistory.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee'
});

// User -> AssetHistory (One to Many) - for performedBy
User.hasMany(AssetHistory, {
    foreignKey: 'performedBy',
    as: 'performedActions',
    onDelete: 'SET NULL'
});
AssetHistory.belongsTo(User, {
    foreignKey: 'performedBy',
    as: 'performer'
});

// AssetRequest associations
Employee.hasMany(AssetRequest, {
    foreignKey: 'employeeId',
    as: 'assetRequests',
    onDelete: 'CASCADE'
});
AssetRequest.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee'
});

User.hasMany(AssetRequest, {
    foreignKey: 'requestedBy',
    as: 'requestsMade',
    onDelete: 'CASCADE'
});
AssetRequest.belongsTo(User, {
    foreignKey: 'requestedBy',
    as: 'requester'
});

User.hasMany(AssetRequest, {
    foreignKey: 'reviewedBy',
    as: 'reviewedRequests',
    onDelete: 'SET NULL'
});
AssetRequest.belongsTo(User, {
    foreignKey: 'reviewedBy',
    as: 'reviewer'
});

Category.hasMany(AssetRequest, {
    foreignKey: 'categoryId',
    as: 'requests',
    onDelete: 'SET NULL'
});
AssetRequest.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

Asset.hasMany(AssetRequest, {
    foreignKey: 'assignedAssetId',
    as: 'fulfillmentRequests',
    onDelete: 'SET NULL'
});
AssetRequest.belongsTo(Asset, {
    foreignKey: 'assignedAssetId',
    as: 'assignedAsset'
});

module.exports = {
    User,
    Employee,
    Category,
    Asset,
    AssetHistory,
    AssetRequest
};
