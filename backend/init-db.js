require('dotenv').config();
const { sequelize } = require('./config/db');
const { User, Employee, Category, Asset, AssetHistory } = require('./models');

const initDatabase = async () => {
    try {
        console.log('🔧 Initializing database...\n');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection OK\n');

        // Sync models in correct order
        console.log('📋 Creating tables in order...');

        // Create tables without foreign key constraints first
        console.log('Creating User table...');
        await User.sync({ force: true });
        console.log('✅ User table created');

        console.log('Creating Employee table...');
        await Employee.sync({ force: true });
        console.log('✅ Employee table created');

        console.log('Creating Category table...');
        await Category.sync({ force: true });
        console.log('✅ Category table created');

        console.log('Creating Asset table...');
        await Asset.sync({ force: true });
        console.log('✅ Asset table created');

        console.log('Creating AssetHistory table...');
        await AssetHistory.sync({ force: true });
        console.log('✅ AssetHistory table created\n');

        console.log('🎉 Database initialized successfully!');
        console.log('\nNext steps:');
        console.log('  1. Run "node seed.js" to populate with sample data');
        console.log('  2. Run "npm run dev" to start the server\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        process.exit(1);
    }
};

initDatabase();
