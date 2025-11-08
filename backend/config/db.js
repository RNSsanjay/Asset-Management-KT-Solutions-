const { Sequelize } = require('sequelize');
const config = require('./database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        dialectOptions: dbConfig.dialectOptions
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);

        // Provide helpful error messages based on error type
        if (error.message.includes('password authentication failed')) {
            console.error('\n🔧 Fix: Your PostgreSQL password is incorrect.');
            console.error('   Run this command as Administrator to reset it:');
            console.error('   powershell -ExecutionPolicy Bypass -File reset-postgres-password.ps1\n');
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
            console.error('\n🔧 Fix: The database does not exist.');
            console.error('   Create it by running:');
            console.error('   psql -U postgres -c "CREATE DATABASE asset_management;"\n');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('\n🔧 Fix: PostgreSQL is not running.');
            console.error('   Start the service with:');
            console.error('   Start-Service postgresql-x64-18\n');
        }

        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };
