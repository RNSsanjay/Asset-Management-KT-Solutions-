const { Asset, Category, AssetHistory, Employee } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            categoryId,
            branch
        } = req.query;
        const offset = (page - 1) * limit;

        // Build filter conditions
        const where = {};
        if (status) where.status = status;
        if (categoryId) where.categoryId = categoryId;
        if (branch) where.branch = branch;
        if (search) {
            where[Op.or] = [
                { assetTag: { [Op.iLike]: `%${search}%` } },
                { serialNumber: { [Op.iLike]: `%${search}%` } },
                { make: { [Op.iLike]: `%${search}%` } },
                { model: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Asset.findAndCountAll({
            where,
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'code']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            assets: rows,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get asset by ID
// @route   GET /api/assets/:id
// @access  Private
const getAssetById = async (req, res, next) => {
    try {
        const asset = await Asset.findByPk(req.params.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'code']
            }]
        });

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        res.json(asset);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private (Admin/Manager)
const createAsset = async (req, res, next) => {
    try {
        const assetData = { ...req.body };

        // Handle file upload
        if (req.file) {
            assetData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const asset = await Asset.create(assetData);

        // Create purchase history
        await AssetHistory.create({
            assetId: asset.id,
            action: 'Purchase',
            actionDate: asset.purchaseDate || new Date(),
            condition: asset.condition,
            performedBy: req.user.id,
            notes: 'Asset purchased and added to inventory'
        });

        const fullAsset = await Asset.findByPk(asset.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'code']
            }]
        });

        res.status(201).json(fullAsset);
    } catch (error) {
        // Delete uploaded file if asset creation fails
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        next(error);
    }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin/Manager)
const updateAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findByPk(req.params.id);

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        const updateData = { ...req.body };

        // Handle file upload
        if (req.file) {
            // Delete old image if exists
            if (asset.imageUrl) {
                const oldImagePath = path.join(__dirname, '..', asset.imageUrl);
                await fs.unlink(oldImagePath).catch(console.error);
            }
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        await asset.update(updateData);

        const updatedAsset = await Asset.findByPk(asset.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'code']
            }]
        });

        res.json(updatedAsset);
    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        next(error);
    }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
const deleteAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findByPk(req.params.id);

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Check if asset is currently assigned
        if (asset.status === 'Assigned') {
            return res.status(400).json({
                message: 'Cannot delete an asset that is currently assigned. Please return it first.'
            });
        }

        // Delete image file if exists
        if (asset.imageUrl) {
            const imagePath = path.join(__dirname, '..', asset.imageUrl);
            await fs.unlink(imagePath).catch(console.error);
        }

        await asset.destroy();
        res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get stock summary
// @route   GET /api/assets/stock/summary
// @access  Private
const getStockSummary = async (req, res, next) => {
    try {
        const { sequelize } = Asset;

        // Total assets by status
        const statusSummary = await Asset.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Total assets by category
        const categorySummary = await Asset.findAll({
            attributes: [
                [sequelize.col('category.name'), 'categoryName'],
                [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('purchase_price')), 'totalValue']
            ],
            include: [{
                model: Category,
                as: 'category',
                attributes: []
            }],
            group: ['category.name'],
            raw: true
        });

        // Total assets by branch
        const branchSummary = await Asset.findAll({
            attributes: [
                'branch',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('purchase_price')), 'totalValue']
            ],
            group: ['branch'],
            raw: true
        });

        // Overall statistics
        const totalAssets = await Asset.count();
        const totalValue = await Asset.sum('purchasePrice') || 0;
        const availableAssets = await Asset.count({ where: { status: 'Available' } });
        const assignedAssets = await Asset.count({ where: { status: 'Assigned' } });

        res.json({
            overview: {
                totalAssets,
                totalValue: parseFloat(totalValue).toFixed(2),
                availableAssets,
                assignedAssets
            },
            byStatus: statusSummary,
            byCategory: categorySummary.map(cat => ({
                ...cat,
                totalValue: parseFloat(cat.totalValue || 0).toFixed(2)
            })),
            byBranch: branchSummary.map(branch => ({
                ...branch,
                totalValue: parseFloat(branch.totalValue || 0).toFixed(2)
            }))
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    getStockSummary
};
