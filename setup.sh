#!/bin/bash

# Asset Management System - Quick Setup Script for Linux/Mac
# Run this script with: bash setup.sh

echo "========================================"
echo "Asset Management System - Quick Setup"
echo "========================================"
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js is installed: $NODE_VERSION"
else
    echo "✗ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check PostgreSQL
echo "Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo "✓ PostgreSQL is installed: $PG_VERSION"
else
    echo "✗ PostgreSQL is not installed!"
    echo "Please install PostgreSQL"
    exit 1
fi

echo ""
echo "========================================"
echo "Setting up Backend..."
echo "========================================"

# Setup Backend
cd backend

echo "Installing backend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠ IMPORTANT: Please edit backend/.env and set your PostgreSQL password!"
    echo "   DB_PASSWORD=your_postgres_password_here"
    echo ""
    read -p "Press Enter when you have updated the .env file..."
else
    echo "✓ .env file already exists"
fi

# Create database
echo ""
echo "Creating database..."
read -sp "Enter your PostgreSQL password: " DB_PASSWORD
echo ""

export PGPASSWORD=$DB_PASSWORD
psql -U postgres -c "CREATE DATABASE asset_management;" 2>&1 || echo "Database may already exist, continuing..."

# Seed database
echo "Seeding database..."
node seed.js

if [ $? -eq 0 ]; then
    echo "✓ Database seeded successfully"
else
    echo "✗ Database seeding failed!"
    echo "Please check your database connection settings in .env"
    cd ..
    exit 1
fi

cd ..

echo ""
echo "========================================"
echo "Setting up Frontend..."
echo "========================================"

# Setup Frontend
cd frontend

echo "Installing frontend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

cd ..

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Start the backend server:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "Default Login Credentials:"
echo "   Admin: admin@assetmanagement.com / admin123"
echo "   Manager: manager@assetmanagement.com / manager123"
echo ""
echo "For detailed documentation, see README.md and SETUP.md"
echo ""
echo "Happy Asset Managing! 🎉"
