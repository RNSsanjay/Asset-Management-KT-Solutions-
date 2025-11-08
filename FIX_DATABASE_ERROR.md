# 🔧 Fix PostgreSQL Authentication Error

## Problem
You're seeing this error:
```
❌ Unable to connect to the database: password authentication failed for user "postgres"
```

## Solution

### **Option 1: Automated Fix (Recommended) ⚡**

1. **Right-click on PowerShell** and select **"Run as Administrator"**

2. **Run the fix script:**
   ```powershell
   cd D:\Placements\Asset-Management-KT-Solutions-
   .\fix-postgres-auth.ps1
   ```

3. **That's it!** The script will automatically:
   - Detect your PostgreSQL version
   - Reset the password to "postgres"
   - Create the database if needed
   - Verify the connection

4. **Start your backend:**
   ```powershell
   cd backend
   npm run dev
   ```

---

### **Option 2: Manual Fix** 🔨

If the automated script doesn't work, follow these steps:

#### Step 1: Find your PostgreSQL version
```powershell
Get-Service -Name "postgresql*"
```
Note the version number (e.g., 18 from "postgresql-x64-18")

#### Step 2: Edit pg_hba.conf
1. Open this file as Administrator:
   ```
   C:\Program Files\PostgreSQL\18\data\pg_hba.conf
   ```
   (Replace `18` with your version)

2. Find lines that look like:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   host    all             all             ::1/128                 scram-sha-256
   ```

3. Change `scram-sha-256` to `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   host    all             all             ::1/128                 trust
   ```

4. Save the file

#### Step 3: Restart PostgreSQL
```powershell
Restart-Service postgresql-x64-18
```
(Replace with your service name)

#### Step 4: Reset password
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

#### Step 5: Restore pg_hba.conf
1. Change `trust` back to `scram-sha-256` in pg_hba.conf
2. Restart PostgreSQL again

#### Step 6: Create database
```powershell
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE asset_management;"
```

---

### **Option 3: Set a Different Password** 🔑

If you want to keep your current PostgreSQL password instead of changing it to "postgres":

1. Find out what your current password is (the one you set during PostgreSQL installation)

2. Update your `.env` file in the backend folder:
   ```env
   DB_PASSWORD=your_actual_password_here
   ```

3. Restart your backend server:
   ```powershell
   cd backend
   npm run dev
   ```

---

## Troubleshooting

### "Access Denied" errors
- Make sure you're running PowerShell as **Administrator**
- Right-click PowerShell → "Run as Administrator"

### Script execution is disabled
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### PostgreSQL service won't start
```powershell
# Check service status
Get-Service postgresql-x64-18

# Try starting it manually
Start-Service postgresql-x64-18
```

### Still getting password errors
1. Check your `.env` file in the backend folder
2. Make sure `DB_PASSWORD` matches the password you set
3. Verify database name: `DB_NAME=asset_management`

---

## Prevention

To prevent this error from happening again:

1. **Remember your PostgreSQL password** - write it down when you first install PostgreSQL

2. **Keep .env in sync** - make sure the `DB_PASSWORD` in `.env` matches your actual PostgreSQL password

3. **Use consistent credentials** - if you reset the password to "postgres", keep it that way for development

---

## Quick Reference

**Default credentials (after running fix script):**
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `asset_management`

**Backend .env should have:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_management
DB_USER=postgres
DB_PASSWORD=postgres
```

---

Need more help? Check:
- `POSTGRESQL_SETUP.md` - Full PostgreSQL setup guide
- `SETUP.md` - General project setup instructions
- `README.md` - Project overview
