# 🚀 Getting Started - Quick Setup Guide

## Step-by-Step Installation

### 1. Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432

**Verify Installation:**
```powershell
psql --version
```

### 2. Create Database

Open PowerShell and run:
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE asset_management;

# List databases to verify:
\l

# Exit psql:
\q
```

### 3. Setup Backend

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Edit .env file with your database credentials
# Use notepad or any text editor:
notepad .env
```

**Update `.env` with your PostgreSQL password:**
```env
DB_PASSWORD=your_postgres_password_here
```

**Seed the database:**
```powershell
node seed.js
```

You should see output like:
```
🌱 Starting database seed...
✅ Users created
✅ Employees created
✅ Categories created
🎉 Database seeded successfully!
```

**Start the backend server:**
```powershell
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Database models synchronized
🚀 Server running in development mode on port 5000
```

### 4. Setup Frontend

Open a **new PowerShell window**:

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

### 6. Login

Use these credentials to login:

**Admin:**
- Email: `admin@assetmanagement.com`
- Password: `admin123`

**Manager:**
- Email: `manager@assetmanagement.com`
- Password: `manager123`

## 🔧 Troubleshooting

### Backend won't start

**Error: "Unable to connect to database"**
```powershell
# Check PostgreSQL is running:
Get-Service -Name postgresql*

# Start PostgreSQL if not running:
Start-Service -Name "postgresql-x64-15"  # or your version
```

**Error: "Database does not exist"**
```powershell
# Create database again:
psql -U postgres -c "CREATE DATABASE asset_management;"
```

### Frontend won't start

**Error: "Module not found"**
```powershell
# Clear node_modules and reinstall:
Remove-Item -Recurse -Force node_modules
npm install
```

**Port 3000 already in use**
```powershell
# Change port in vite.config.js or kill process on port 3000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Database Issues

**Reset database:**
```powershell
# Drop and recreate:
psql -U postgres -c "DROP DATABASE asset_management;"
psql -U postgres -c "CREATE DATABASE asset_management;"

# Run seed again:
cd backend
node seed.js
```

## 📝 Development Workflow

### Making Changes

**Backend:**
1. Edit files in `backend/` folder
2. Server auto-restarts with nodemon
3. Check console for errors

**Frontend:**
1. Edit files in `frontend/src/` folder
2. Vite hot-reloads changes automatically
3. Check browser console for errors

### Adding New Features

1. **Backend API:**
   - Create controller in `backend/controllers/`
   - Create route in `backend/routes/`
   - Add route to `backend/server.js`

2. **Frontend Page:**
   - Create component in `frontend/src/pages/`
   - Add route in `frontend/src/App.jsx`
   - Create API functions in relevant service

### Testing API with Postman

Import this collection: `http://localhost:5000/api/health`

**Get Token:**
```json
POST http://localhost:5000/api/auth/login
{
  "email": "admin@assetmanagement.com",
  "password": "admin123"
}
```

**Use Token in Headers:**
```
Authorization: Bearer <your_token>
```

## 🐳 Docker Deployment (Optional)

If you have Docker installed:

```powershell
# Build and start all services
docker-compose up -d

# Seed database
docker-compose exec backend node seed.js

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access at http://localhost (port 80)

## 📚 Next Steps

1. ✅ Explore the Dashboard
2. ✅ Add some test employees
3. ✅ Create asset categories
4. ✅ Add assets with images
5. ✅ Issue assets to employees
6. ✅ Generate reports

## 🎉 You're All Set!

Your Asset Management System is now running! 

Need help? Check the main README.md for detailed documentation.

---

**Happy Coding! 💻**
