# PostgreSQL Authentication Fix Script
# This script MUST be run as Administrator
# Right-click PowerShell and select "Run as Administrator"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "How to fix:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Run this script again:" -ForegroundColor White
    Write-Host "   cd 'D:\Placements\Asset-Management-KT-Solutions-'" -ForegroundColor Cyan
    Write-Host "   .\fix-postgres-auth.ps1" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  PostgreSQL Authentication Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Find PostgreSQL service
Write-Host "[1/8] Detecting PostgreSQL installation..." -ForegroundColor Yellow
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $service) {
    Write-Host "❌ ERROR: No PostgreSQL service found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$serviceName = $service.Name
if ($serviceName -match '(\d+)$') {
    $version = $Matches[1]
} else {
    Write-Host "❌ ERROR: Could not detect PostgreSQL version" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "   ✅ Found: $serviceName (Version $version)" -ForegroundColor Green

# Set paths
$dataDir = "C:\Program Files\PostgreSQL\$version\data"
$pgHbaConf = Join-Path $dataDir "pg_hba.conf"
$psqlPath = "C:\Program Files\PostgreSQL\$version\bin\psql.exe"
$newPassword = "postgres"

# Verify paths
Write-Host "`n[2/8] Verifying installation paths..." -ForegroundColor Yellow
if (-not (Test-Path $dataDir)) {
    Write-Host "   ❌ ERROR: Data directory not found: $dataDir" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
if (-not (Test-Path $psqlPath)) {
    Write-Host "   ❌ ERROR: psql.exe not found: $psqlPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "   ✅ All paths verified" -ForegroundColor Green

# Backup pg_hba.conf
Write-Host "`n[3/8] Creating backup of pg_hba.conf..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupPath = "$pgHbaConf.backup_$timestamp"
Copy-Item $pgHbaConf $backupPath -Force
Write-Host "   ✅ Backup saved: $backupPath" -ForegroundColor Green

# Modify pg_hba.conf to allow trust authentication
Write-Host "`n[4/8] Temporarily disabling password authentication..." -ForegroundColor Yellow
$content = Get-Content $pgHbaConf
$originalContent = $content
$newContent = $content -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust' -replace 'peer', 'trust'
$newContent | Set-Content $pgHbaConf -Force -Encoding UTF8
Write-Host "   ✅ Authentication temporarily disabled" -ForegroundColor Green

# Restart PostgreSQL
Write-Host "`n[5/8] Restarting PostgreSQL service..." -ForegroundColor Yellow
try {
    Stop-Service $serviceName -Force -ErrorAction Stop
    Start-Sleep -Seconds 2
    Start-Service $serviceName -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Service restarted successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ ERROR: Failed to restart service: $_" -ForegroundColor Red
    # Restore original config
    $originalContent | Set-Content $pgHbaConf -Force -Encoding UTF8
    Read-Host "Press Enter to exit"
    exit 1
}

# Reset password
Write-Host "`n[6/8] Resetting postgres user password to 'postgres'..." -ForegroundColor Yellow
$sqlCommand = "ALTER USER postgres WITH PASSWORD '$newPassword';"
try {
    $output = & $psqlPath -U postgres -d postgres -c $sqlCommand 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Password reset successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Warning: Command completed with warnings" -ForegroundColor Yellow
        Write-Host "   Output: $output" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Warning: $_" -ForegroundColor Yellow
}

# Restore pg_hba.conf
Write-Host "`n[7/8] Restoring secure authentication settings..." -ForegroundColor Yellow
$originalContent | Set-Content $pgHbaConf -Force -Encoding UTF8
Write-Host "   ✅ Security settings restored" -ForegroundColor Green

# Final restart
Write-Host "`n[8/8] Restarting PostgreSQL with secure settings..." -ForegroundColor Yellow
Stop-Service $serviceName -Force
Start-Sleep -Seconds 2
Start-Service $serviceName
Start-Sleep -Seconds 3
Write-Host "   ✅ Service restarted" -ForegroundColor Green

# Verify connection
Write-Host "`n[VERIFY] Testing database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $newPassword
$testOutput = & $psqlPath -U postgres -d postgres -c "SELECT 'Connection successful!' as status;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Connection verified successfully!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Connection test had issues:" -ForegroundColor Yellow
    Write-Host "   $testOutput" -ForegroundColor Gray
}

# Create database if it doesn't exist
Write-Host "`n[BONUS] Creating 'asset_management' database if needed..." -ForegroundColor Yellow
$createDbOutput = & $psqlPath -U postgres -d postgres -c "CREATE DATABASE asset_management;" 2>&1
if ($createDbOutput -like "*already exists*") {
    Write-Host "   ℹ️  Database already exists" -ForegroundColor Cyan
} elseif ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database created successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Warning: $createDbOutput" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  ✅ FIX COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your PostgreSQL credentials:" -ForegroundColor Cyan
Write-Host "  Host:     localhost" -ForegroundColor White
Write-Host "  Port:     5432" -ForegroundColor White
Write-Host "  User:     postgres" -ForegroundColor White
Write-Host "  Password: postgres" -ForegroundColor White
Write-Host "  Database: asset_management" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Go to your backend directory:" -ForegroundColor White
Write-Host "     cd D:\Placements\Asset-Management-KT-Solutions-\backend" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Start your backend server:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. If tables are empty, seed the database:" -ForegroundColor White
Write-Host "     node seed.js" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
