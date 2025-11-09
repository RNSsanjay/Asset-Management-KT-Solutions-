const { AssetRequest, Employee, User, Category, Asset } = require('../models');
const { Op } = require('sequelize');

// Create a new asset request (Employee only)
exports.createRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { employeeId, categoryId, assetType, justification, priority } = req.body;

        // Find employee record matching the user's email
        const user = await User.findByPk(userId);
        const employee = await Employee.findOne({ where: { email: user.email } });

        if (!employee) {
            return res.status(400).json({ message: 'No employee record found for this user' });
        }

        const request = await AssetRequest.create({
            employeeId: employee.id,
            requestedBy: userId,
            categoryId: categoryId || null,
            assetType,
            justification,
            priority: priority || 'Medium',
            status: 'Pending'
        });

        const requestWithDetails = await AssetRequest.findByPk(request.id, {
            include: [
                { model: Employee, as: 'employee' },
                { model: User, as: 'requester' },
                { model: Category, as: 'category' }
            ]
        });

        res.status(201).json(requestWithDetails);
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ message: 'Error creating asset request', error: error.message });
    }
};

// Get all requests (Admin/Manager see all, Employee sees own)
exports.getAllRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let whereClause = {};

        // Employees only see their own requests
        if (userRole === 'Employee') {
            whereClause.requestedBy = userId;
        }

        const requests = await AssetRequest.findAll({
            where: whereClause,
            include: [
                { model: Employee, as: 'employee' },
                { model: User, as: 'requester', attributes: ['id', 'email', 'role'] },
                { model: User, as: 'reviewer', attributes: ['id', 'email', 'role'] },
                { model: Category, as: 'category' },
                { model: Asset, as: 'assignedAsset' }
            ],
            order: [['requestDate', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
};

// Get single request by ID
exports.getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const request = await AssetRequest.findByPk(id, {
            include: [
                { model: Employee, as: 'employee' },
                { model: User, as: 'requester', attributes: ['id', 'email', 'role'] },
                { model: User, as: 'reviewer', attributes: ['id', 'email', 'role'] },
                { model: Category, as: 'category' },
                { model: Asset, as: 'assignedAsset' }
            ]
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Employees can only view their own requests
        if (userRole === 'Employee' && request.requestedBy !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(request);
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ message: 'Error fetching request', error: error.message });
    }
};

// Review request (Admin/Manager only)
exports.reviewRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes, assignedAssetId } = req.body;
        const reviewerId = req.user.id;

        const request = await AssetRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Request has already been reviewed' });
        }

        await request.update({
            status,
            reviewedBy: reviewerId,
            reviewDate: new Date(),
            reviewNotes: reviewNotes || null,
            assignedAssetId: assignedAssetId || null
        });

        const updatedRequest = await AssetRequest.findByPk(id, {
            include: [
                { model: Employee, as: 'employee' },
                { model: User, as: 'requester', attributes: ['id', 'email', 'role'] },
                { model: User, as: 'reviewer', attributes: ['id', 'email', 'role'] },
                { model: Category, as: 'category' },
                { model: Asset, as: 'assignedAsset' }
            ]
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Review request error:', error);
        res.status(500).json({ message: 'Error reviewing request', error: error.message });
    }
};

// Delete request (Employee can delete own pending requests, Admin/Manager can delete any)
exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const request = await AssetRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Employees can only delete their own pending requests
        if (userRole === 'Employee') {
            if (request.requestedBy !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }
            if (request.status !== 'Pending') {
                return res.status(400).json({ message: 'Cannot delete a reviewed request' });
            }
        }

        await request.destroy();
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ message: 'Error deleting request', error: error.message });
    }
};

// Get pending requests count (for notifications)
exports.getPendingCount = async (req, res) => {
    try {
        const count = await AssetRequest.count({
            where: { status: 'Pending' }
        });
        res.json({ count });
    } catch (error) {
        console.error('Get pending count error:', error);
        res.status(500).json({ message: 'Error fetching count', error: error.message });
    }
};
