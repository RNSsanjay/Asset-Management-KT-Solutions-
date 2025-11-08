const { Asset, AssetHistory, Employee, User } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

// @desc    Issue asset to employee
// @route   POST /api/asset-history/issue
// @access  Private (Admin/Manager)
const issueAsset = async (req, res, next) => {
    try {
        const { assetId, employeeId, condition, notes } = req.body;

        // Check if asset exists and is available
        const asset = await Asset.findByPk(assetId);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        if (asset.status !== 'Available') {
            return res.status(400).json({
                message: `Asset is currently ${asset.status}. Only available assets can be issued.`
            });
        }

        // Check if employee exists
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (employee.status !== 'active') {
            return res.status(400).json({ message: 'Cannot issue asset to inactive employee' });
        }

        // Update asset status
        await asset.update({
            status: 'Assigned',
            condition: condition || asset.condition
        });

        // Create history record
        const history = await AssetHistory.create({
            assetId,
            employeeId,
            action: 'Issue',
            actionDate: new Date(),
            condition: condition || asset.condition,
            performedBy: req.user.id,
            notes
        });

        const fullHistory = await AssetHistory.findByPk(history.id, {
            include: [
                { model: Asset, as: 'asset' },
                { model: Employee, as: 'employee' },
                { model: User, as: 'performer', attributes: ['id', 'name', 'email'] }
            ]
        });

        res.status(201).json(fullHistory);
    } catch (error) {
        next(error);
    }
};

// @desc    Return asset from employee
// @route   POST /api/asset-history/return
// @access  Private (Admin/Manager)
const returnAsset = async (req, res, next) => {
    try {
        const { assetId, condition, reason, notes } = req.body;

        // Check if asset exists and is assigned
        const asset = await Asset.findByPk(assetId);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        if (asset.status !== 'Assigned') {
            return res.status(400).json({
                message: 'Asset is not currently assigned to any employee'
            });
        }

        // Get last issue record to find employee
        const lastIssue = await AssetHistory.findOne({
            where: {
                assetId,
                action: 'Issue'
            },
            order: [['actionDate', 'DESC']]
        });

        // Determine new status based on condition
        let newStatus = 'Available';
        if (condition === 'Poor' || reason?.toLowerCase().includes('repair')) {
            newStatus = 'Under Repair';
        }

        // Update asset status
        await asset.update({
            status: newStatus,
            condition: condition || asset.condition
        });

        // Create history record
        const history = await AssetHistory.create({
            assetId,
            employeeId: lastIssue ? lastIssue.employeeId : null,
            action: 'Return',
            actionDate: new Date(),
            condition: condition || asset.condition,
            reason,
            performedBy: req.user.id,
            notes
        });

        const fullHistory = await AssetHistory.findByPk(history.id, {
            include: [
                { model: Asset, as: 'asset' },
                { model: Employee, as: 'employee' },
                { model: User, as: 'performer', attributes: ['id', 'name', 'email'] }
            ]
        });

        res.status(201).json(fullHistory);
    } catch (error) {
        next(error);
    }
};

// @desc    Scrap asset
// @route   POST /api/asset-history/scrap
// @access  Private (Admin)
const scrapAsset = async (req, res, next) => {
    try {
        const { assetId, reason, notes } = req.body;

        // Check if asset exists
        const asset = await Asset.findByPk(assetId);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        if (asset.status === 'Assigned') {
            return res.status(400).json({
                message: 'Cannot scrap an assigned asset. Please return it first.'
            });
        }

        // Update asset status
        await asset.update({
            status: 'Scrapped',
            condition: 'Poor'
        });

        // Create history record
        const history = await AssetHistory.create({
            assetId,
            action: 'Scrap',
            actionDate: new Date(),
            condition: 'Poor',
            reason,
            performedBy: req.user.id,
            notes
        });

        const fullHistory = await AssetHistory.findByPk(history.id, {
            include: [
                { model: Asset, as: 'asset' },
                { model: User, as: 'performer', attributes: ['id', 'name', 'email'] }
            ]
        });

        res.status(201).json(fullHistory);
    } catch (error) {
        next(error);
    }
};

// @desc    Get asset history
// @route   GET /api/asset-history
// @access  Private
const getAssetHistory = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            assetId,
            employeeId,
            action,
            startDate,
            endDate
        } = req.query;
        const offset = (page - 1) * limit;

        // Build filter conditions
        const where = {};
        if (assetId) where.assetId = assetId;
        if (employeeId) where.employeeId = employeeId;
        if (action) where.action = action;
        if (startDate || endDate) {
            where.actionDate = {};
            if (startDate) where.actionDate[Op.gte] = new Date(startDate);
            if (endDate) where.actionDate[Op.lte] = new Date(endDate);
        }

        const { count, rows } = await AssetHistory.findAndCountAll({
            where,
            include: [
                {
                    model: Asset,
                    as: 'asset',
                    attributes: ['id', 'assetTag', 'serialNumber', 'make', 'model']
                },
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'name', 'employeeId', 'department']
                },
                {
                    model: User,
                    as: 'performer',
                    attributes: ['id', 'name', 'email']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['actionDate', 'DESC']]
        });

        res.json({
            history: rows,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get asset timeline
// @route   GET /api/asset-history/timeline/:assetId
// @access  Private
const getAssetTimeline = async (req, res, next) => {
    try {
        const timeline = await AssetHistory.findAll({
            where: { assetId: req.params.assetId },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'name', 'employeeId']
                },
                {
                    model: User,
                    as: 'performer',
                    attributes: ['id', 'name']
                }
            ],
            order: [['actionDate', 'DESC']]
        });

        res.json(timeline);
    } catch (error) {
        next(error);
    }
};

// @desc    Generate asset history report (PDF)
// @route   GET /api/asset-history/report/pdf
// @access  Private
const generatePDFReport = async (req, res, next) => {
    try {
        const { assetId, startDate, endDate } = req.query;

        const where = {};
        if (assetId) where.assetId = assetId;
        if (startDate || endDate) {
            where.actionDate = {};
            if (startDate) where.actionDate[Op.gte] = new Date(startDate);
            if (endDate) where.actionDate[Op.lte] = new Date(endDate);
        }

        const history = await AssetHistory.findAll({
            where,
            include: [
                { model: Asset, as: 'asset' },
                { model: Employee, as: 'employee' },
                { model: User, as: 'performer', attributes: ['name'] }
            ],
            order: [['actionDate', 'DESC']]
        });

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=asset-history-report.pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Asset History Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Content
        history.forEach((record, index) => {
            if (index > 0) doc.moveDown();

            doc.fontSize(12).text(`${index + 1}. ${record.action}`, { underline: true });
            doc.fontSize(10);
            doc.text(`Date: ${new Date(record.actionDate).toLocaleDateString()}`);
            doc.text(`Asset: ${record.asset?.assetTag} - ${record.asset?.make} ${record.asset?.model}`);
            if (record.employee) {
                doc.text(`Employee: ${record.employee.name} (${record.employee.employeeId})`);
            }
            if (record.condition) {
                doc.text(`Condition: ${record.condition}`);
            }
            if (record.reason) {
                doc.text(`Reason: ${record.reason}`);
            }
            if (record.notes) {
                doc.text(`Notes: ${record.notes}`);
            }
            doc.text(`Performed by: ${record.performer?.name || 'Unknown'}`);

            if (index < history.length - 1) {
                doc.moveDown().strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            }
        });

        doc.end();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    issueAsset,
    returnAsset,
    scrapAsset,
    getAssetHistory,
    getAssetTimeline,
    generatePDFReport
};
