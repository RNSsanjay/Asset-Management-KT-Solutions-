const { sequelize } = require('./config/db');
const { User, Employee, Category } = require('./models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // Clear existing data (optional - be careful in production!)
        await sequelize.sync({ force: true });

        // Create admin user
        await User.create({
            name: 'Admin User',
            email: 'admin@assetmanagement.com',
            password: 'admin123',
            role: 'Admin',
            status: 'active'
        });

        // Create manager user
        await User.create({
            name: 'Manager User',
            email: 'manager@assetmanagement.com',
            password: 'manager123',
            role: 'Manager',
            status: 'active'
        });

        console.log('✅ Users created');

        // Create sample employees
        const employees = [
            {
                employeeId: 'EMP001',
                name: 'John Doe',
                department: 'IT',
                designation: 'Software Engineer',
                contact: '+1234567890',
                email: 'john.doe@company.com',
                branch: 'Head Office',
                status: 'active',
                joiningDate: new Date('2023-01-15')
            },
            {
                employeeId: 'EMP002',
                name: 'Jane Smith',
                department: 'HR',
                designation: 'HR Manager',
                contact: '+1234567891',
                email: 'jane.smith@company.com',
                branch: 'Head Office',
                status: 'active',
                joiningDate: new Date('2022-06-10')
            },
            {
                employeeId: 'EMP003',
                name: 'Bob Johnson',
                department: 'Finance',
                designation: 'Accountant',
                contact: '+1234567892',
                email: 'bob.johnson@company.com',
                branch: 'Branch A',
                status: 'active',
                joiningDate: new Date('2023-03-20')
            }
        ];

        await Employee.bulkCreate(employees);
        console.log('✅ Employees created');

        // Create sample categories
        const categories = [
            { name: 'Laptop', code: 'LAP', description: 'Laptop computers', status: 'active' },
            { name: 'Desktop', code: 'DSK', description: 'Desktop computers', status: 'active' },
            { name: 'Mobile Phone', code: 'MOB', description: 'Mobile phones and smartphones', status: 'active' },
            { name: 'Monitor', code: 'MON', description: 'Computer monitors', status: 'active' },
            { name: 'Keyboard', code: 'KEY', description: 'Computer keyboards', status: 'active' },
            { name: 'Mouse', code: 'MOU', description: 'Computer mice', status: 'active' },
            { name: 'Printer', code: 'PRI', description: 'Printers and scanners', status: 'active' },
            { name: 'Router', code: 'ROU', description: 'Network routers', status: 'active' }
        ];

        await Category.bulkCreate(categories);
        console.log('✅ Categories created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login credentials:');
        console.log('Admin:');
        console.log('  Email: admin@assetmanagement.com');
        console.log('  Password: admin123');
        console.log('\nManager:');
        console.log('  Email: manager@assetmanagement.com');
        console.log('  Password: manager123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
