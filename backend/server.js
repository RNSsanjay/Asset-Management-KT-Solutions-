require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { sequelize, testConnection } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/error');

// Load all models
require('./models');

// Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const categoryRoutes = require('./routes/categories');
const assetRoutes = require('./routes/assets');
const assetHistoryRoutes = require('./routes/assetHistory');
const assetRequestRoutes = require('./routes/assetRequests');

const app = express();

// Security
app.use(helmet());

// Rate limiter to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Enable CORS for frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        next();
    });
}

// Dev logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup all API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/asset-history', assetHistoryRoutes);
app.use('/api/asset-requests', assetRequestRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the server
const startServer = async () => {
    try {
        // Test DB connection first
        await testConnection();

        // Sync database models (run init-db.js first for initial setup)
        await sequelize.sync();

        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
