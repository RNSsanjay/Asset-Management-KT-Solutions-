# 🐳 Docker Quick Start (No PostgreSQL Installation Needed!)

If you have Docker Desktop installed, you can skip PostgreSQL installation entirely!

## ✅ Prerequisites
- Docker Desktop for Windows installed and running
- Get it from: https://www.docker.com/products/docker-desktop/

## 🚀 Super Quick Start (3 Commands)

```powershell
# 1. Start all services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# 2. Wait 10 seconds, then seed the database
Start-Sleep -Seconds 10
docker-compose exec backend node seed.js

# 3. Open browser
Start-Process "http://localhost"
```

That's it! Your application is now running! 🎉

## 📝 Detailed Steps

### Step 1: Verify Docker is Running
```powershell
docker --version
docker-compose --version
```

### Step 2: Build and Start Services
```powershell
cd D:\Placements\Asset-Management-KT-Solutions-
docker-compose up -d
```

This will:
- ✅ Create a PostgreSQL database container
- ✅ Build and start the backend API
- ✅ Build and start the frontend
- ✅ Set up networking between services

### Step 3: Check Services are Running
```powershell
docker-compose ps
```

You should see 3 services running:
- `asset-postgres` (PostgreSQL)
- `asset-backend` (Node.js API)
- `asset-frontend` (React app)

### Step 4: Seed the Database
```powershell
docker-compose exec backend node seed.js
```

### Step 5: Access the Application
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000/api/health

### Login Credentials
- **Admin**: admin@assetmanagement.com / admin123
- **Manager**: manager@assetmanagement.com / manager123

## 🔧 Useful Docker Commands

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```powershell
docker-compose stop
```

### Stop and Remove Everything
```powershell
# Keep database data
docker-compose down

# Remove everything including database
docker-compose down -v
```

### Rebuild After Code Changes
```powershell
docker-compose down
docker-compose up -d --build
```

## 🐛 Troubleshooting

### Issue: Port already in use
```powershell
# Stop any services using ports 80, 5000, or 5432
# Then try again
docker-compose down
docker-compose up -d
```

### Issue: Backend can't connect to database
```powershell
# Check if postgres container is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart everything
docker-compose restart
```

### Issue: Changes not reflecting
```powershell
# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Issue: Database reset needed
```powershell
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Seed database again
docker-compose exec backend node seed.js
```

## 📊 Container Management

### Access Database Directly
```powershell
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d asset_management

# In psql prompt:
\dt                 # List tables
SELECT * FROM users;   # Query users
\q                     # Exit
```

### Access Backend Container
```powershell
docker-compose exec backend sh

# Now you're inside the container
ls
exit
```

## 🔄 Development Workflow with Docker

### For Backend Changes:
1. Edit files in `backend/` folder
2. Rebuild: `docker-compose restart backend` or `docker-compose up -d --build backend`

### For Frontend Changes:
1. Edit files in `frontend/src/` folder
2. Rebuild: `docker-compose restart frontend` or `docker-compose up -d --build frontend`

### For Database Schema Changes:
1. Update models in `backend/models/`
2. Restart backend: `docker-compose restart backend`
3. Reseed if needed: `docker-compose exec backend node seed.js`

## 📈 Production Deployment

The same docker-compose.yml works for production! Just:
1. Update environment variables in docker-compose.yml
2. Set strong passwords
3. Use a managed database service
4. Deploy to AWS, Azure, DigitalOcean, etc.

## 💡 Why Docker?

✅ **No PostgreSQL installation needed**  
✅ **Consistent environment across machines**  
✅ **Easy to reset and start fresh**  
✅ **Production-ready setup**  
✅ **One command to start everything**

---

## 🎯 Complete Setup Script

Save this as `docker-setup.ps1`:

```powershell
# Docker Setup Script
Write-Host "🐳 Starting Asset Management System with Docker..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Navigate to project directory
Set-Location D:\Placements\Asset-Management-KT-Solutions-

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
docker-compose exec -T backend node seed.js

# Show status
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🌐 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000/api/health" -ForegroundColor White

Write-Host "`n🔑 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:   admin@assetmanagement.com / admin123" -ForegroundColor White
Write-Host "   Manager: manager@assetmanagement.com / manager123" -ForegroundColor White

Write-Host "`n📝 View logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop:      docker-compose down" -ForegroundColor Yellow

# Open browser
Write-Host "`n🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost"
```

Run it:
```powershell
.\docker-setup.ps1
```

---

**Enjoy your containerized Asset Management System! 🐳✨**
