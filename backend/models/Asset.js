const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Asset = sequelize.define('Asset', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    assetTag: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'asset_tag'
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'serial_number'
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'category_id',
        references: { model: 'categories', key: 'id' }
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    specifications: DataTypes.TEXT,
    purchaseDate: {
        type: DataTypes.DATE,
        field: 'purchase_date'
    },
    purchasePrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'purchase_price',
        defaultValue: 0
    },
    warrantyExpiry: {
        type: DataTypes.DATE,
        field: 'warranty_expiry'
    },
    vendor: DataTypes.STRING,
    branch: {
        type: DataTypes.STRING,
        defaultValue: 'Head Office'
    },
    location: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM('Available', 'Assigned', 'Under Repair', 'Scrapped'),
        defaultValue: 'Available'
    },
    condition: {
        type: DataTypes.ENUM('Excellent', 'Good', 'Fair', 'Poor'),
        defaultValue: 'Good'
    },
    imageUrl: {
        type: DataTypes.STRING,
        field: 'image_url'
    },
    notes: DataTypes.TEXT
}, {
    timestamps: true,
    tableName: 'assets'
});

module.exports = Asset;
