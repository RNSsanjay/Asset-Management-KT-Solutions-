# Asset Management System - Quick Setup Script
# Run this script in PowerShell with: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Asset Management System - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL is installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL is not installed!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Backend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Setup Backend
cd backend

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Please edit backend/.env and set your PostgreSQL password!" -ForegroundColor Yellow
    Write-Host "   DB_PASSWORD=your_postgres_password_here" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Press Enter when you have updated the .env file, or type 'skip' to continue anyway"
    if ($continue -ne "skip") {
        Write-Host "Please update backend/.env with your PostgreSQL password and run this script again." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Create database
Write-Host ""
Write-Host "Creating database..." -ForegroundColor Yellow
$dbPassword = Read-Host "Enter your PostgreSQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$env:PGPASSWORD = $plainPassword
try {
    psql -U postgres -c "CREATE DATABASE asset_management;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
        Write-Host "✓ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "Database may already exist, continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "✓ Database may already exist, continuing..." -ForegroundColor Yellow
}

# Seed database
Write-Host "Seeding database..." -ForegroundColor Yellow
node seed.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Database seeding failed!" -ForegroundColor Red
    Write-Host "Please check your database connection settings in .env" -ForegroundColor Yellow
    cd ..
    exit 1
}

cd ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Frontend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Setup Frontend
cd frontend

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

cd ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Cyan
Write-Host "   Admin: admin@assetmanagement.com / admin123" -ForegroundColor Yellow
Write-Host "   Manager: manager@assetmanagement.com / manager123" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed documentation, see README.md and SETUP.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy Asset Managing! 🎉" -ForegroundColor Green
