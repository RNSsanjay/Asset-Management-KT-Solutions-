const { Category, Asset } = require('../models');
const { Op } = require('sequelize');

// Get all categories
const getCategories = async (req, res, next) => {
    try {
        const { status, search } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { code: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const categories = await Category.findAll({
            where,
            include: [{
                model: Asset,
                as: 'assets',
                attributes: ['id'],
                required: false
            }],
            order: [['name', 'ASC']]
        });

        // Count assets for each category
        const categoriesWithCount = categories.map(cat => {
            const catData = cat.toJSON();
            catData.assetCount = catData.assets ? catData.assets.length : 0;
            delete catData.assets;
            return catData;
        });

        res.json(categoriesWithCount);
    } catch (error) {
        next(error);
    }
};

// Get single category
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        next(error);
    }
};

// Create category
const createCategory = async (req, res, next) => {
    try {
        const { code } = req.body;

        // Make code uppercase
        req.body.code = code.toUpperCase();

        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

// Update category
const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (req.body.code) {
            req.body.code = req.body.code.toUpperCase();
        }

        await category.update(req.body);
        res.json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if category has assets
        const assetCount = await Asset.count({ where: { categoryId: req.params.id } });
        if (assetCount > 0) {
            return res.status(400).json({
                message: `Cannot delete category. ${assetCount} asset(s) are associated with this category.`
            });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
