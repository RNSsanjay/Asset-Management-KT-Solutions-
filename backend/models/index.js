const User = require('./User');
const Employee = require('./Employee');
const Category = require('./Category');
const Asset = require('./Asset');
const AssetHistory = require('./AssetHistory');

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

module.exports = {
    User,
    Employee,
    Category,
    Asset,
    AssetHistory
};
