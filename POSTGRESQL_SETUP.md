# 🚀 Quick Setup Guide - PostgreSQL Installation & Configuration

## ⚠️ Current Issue
Your backend can't connect to PostgreSQL because it's not installed yet.

## 📥 Step 1: Install PostgreSQL

### Option A: Download Official Installer (Recommended)
1. **Download PostgreSQL 15 or 16**:
   - Visit: https://www.postgresql.org/download/windows/
   - Download the Windows x86-64 installer
   - File size: ~300 MB

2. **Run the Installer**:
   - Double-click the downloaded `.exe` file
   - Click "Next" through the setup wizard
   - **IMPORTANT**: When asked for a password, set: `postgres`
     (This matches the default in `.env.example`)
   - Keep the default port: `5432`
   - Select all components (PostgreSQL Server, pgAdmin, etc.)
   - Complete the installation

3. **Verify Installation**:
   ```powershell
   # Check if PostgreSQL service is running
   Get-Service -Name "postgresql*"
   
   # Try connecting
   psql --version
   ```

### Option B: Use Docker (Alternative)
If you prefer Docker instead:
```powershell
# Pull and run PostgreSQL container
docker run --name asset-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Verify it's running
docker ps
```

## 🔧 Step 2: Create Database

Once PostgreSQL is installed:

```powershell
# Open PowerShell and connect to PostgreSQL
psql -U postgres

# In the PostgreSQL prompt, create the database:
CREATE DATABASE asset_management;

# Verify database was created:
\l

# Exit:
\q
```

**OR** use this one-liner:
```powershell
psql -U postgres -c "CREATE DATABASE asset_management;"
```

## ⚙️ Step 3: Configure Backend Environment

1. **Copy the example environment file**:
   ```powershell
   cd D:\Placements\Asset-Management-KT-Solutions-\backend
   Copy-Item .env.example .env
   ```

2. **Edit `.env` file** (use notepad or VS Code):
   ```powershell
   notepad .env
   ```

3. **Verify these settings match your PostgreSQL installation**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=asset_management
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

## 🌱 Step 4: Seed the Database

```powershell
cd D:\Placements\Asset-Management-KT-Solutions-\backend
node seed.js
```

You should see:
```
🌱 Starting database seed...
✅ Users created
✅ Employees created
✅ Categories created
🎉 Database seeded successfully!
```

## ▶️ Step 5: Start the Backend Server

```powershell
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Database models synchronized
🚀 Server running in development mode on port 5000
```

## 🌐 Step 6: Access Your Application

### Backend API
- Health Check: http://localhost:5000/api/health
- API Documentation: See README.md

### Frontend
Open a new PowerShell window:
```powershell
cd D:\Placements\Asset-Management-KT-Solutions-\frontend
npm install --legacy-peer-deps
npm run dev
```
- Frontend: http://localhost:3000

### Login Credentials
- **Admin**: admin@assetmanagement.com / admin123
- **Manager**: manager@assetmanagement.com / manager123

---

## 🐛 Troubleshooting

### Issue: PostgreSQL service won't start
```powershell
# Start the service manually
Start-Service -Name "postgresql-x64-15"  # or your version number
```

### Issue: Password authentication failed
```powershell
# Reset password
# 1. Find pg_hba.conf file (usually in C:\Program Files\PostgreSQL\15\data\)
# 2. Change 'md5' to 'trust' temporarily
# 3. Restart PostgreSQL service
# 4. Connect without password: psql -U postgres
# 5. Set password: ALTER USER postgres PASSWORD 'postgres';
# 6. Change 'trust' back to 'md5' in pg_hba.conf
# 7. Restart service
```

### Issue: Port 5432 already in use
```powershell
# Find what's using the port
Get-NetTCPConnection -LocalPort 5432

# Stop the process (get PID from above command)
Stop-Process -Id <PID> -Force
```

### Issue: Cannot connect to database
1. Check if PostgreSQL service is running:
   ```powershell
   Get-Service -Name "postgresql*"
   ```

2. Verify database exists:
   ```powershell
   psql -U postgres -l
   ```

3. Test connection:
   ```powershell
   psql -U postgres -d asset_management
   ```

### Issue: Backend still can't connect
Check your `.env` file has correct values and restart the backend:
```powershell
# Stop the backend (Ctrl+C)
# Start again
npm run dev
```

---

## ✅ Quick Verification Checklist

- [ ] PostgreSQL 15/16 installed
- [ ] PostgreSQL service is running
- [ ] Database `asset_management` created
- [ ] `.env` file configured in backend folder
- [ ] Database seeded with test data
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login with admin credentials

---

## 🎯 After PostgreSQL is Installed

Run these commands in order:

```powershell
# 1. Create database
psql -U postgres -c "CREATE DATABASE asset_management;"

# 2. Navigate to backend
cd D:\Placements\Asset-Management-KT-Solutions-\backend

# 3. Create .env file (if not exists)
Copy-Item .env.example .env -ErrorAction SilentlyContinue

# 4. Seed database
node seed.js

# 5. Start backend
npm run dev
```

Then in a **new PowerShell window**:
```powershell
# Start frontend
cd D:\Placements\Asset-Management-KT-Solutions-\frontend
npm run dev
```

Open browser: http://localhost:3000

---

## 💡 Alternative: Use Docker Compose (All-in-One)

If you have Docker Desktop installed:

```powershell
# Start everything (PostgreSQL + Backend + Frontend)
docker-compose up -d

# Seed database
docker-compose exec backend node seed.js

# Access application
# Frontend: http://localhost
# Backend: http://localhost:5000
```

---

**Need More Help?** 
- Check the main README.md file
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Contact: Open an issue in the repository

**Happy Coding! 🚀**
