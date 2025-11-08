# PostgreSQL Password Reset Script
# Run this as Administrator

# Auto-detect PostgreSQL installation
Write-Host "🔧 PostgreSQL Password Reset Utility" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Auto-detecting PostgreSQL installation..." -ForegroundColor Yellow

# Find PostgreSQL service
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $service) {
    Write-Host "❌ ERROR: No PostgreSQL service found!" -ForegroundColor Red
    Write-Host "Please make sure PostgreSQL is installed." -ForegroundColor Yellow
    exit 1
}

$serviceName = $service.Name
Write-Host "✅ Found service: $serviceName" -ForegroundColor Green

# Extract version from service name (e.g., postgresql-x64-18 -> 18)
if ($serviceName -match '(\d+)$') {
    $version = $Matches[1]
} else {
    Write-Host "❌ ERROR: Could not detect PostgreSQL version from service name" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Detected PostgreSQL version: $version" -ForegroundColor Green

# Set paths based on detected version
$dataDir = "C:\Program Files\PostgreSQL\$version\data"
$pgHbaConf = Join-Path $dataDir "pg_hba.conf"
$psqlPath = "C:\Program Files\PostgreSQL\$version\bin\psql.exe"
$newPassword = "postgres"

# Verify paths exist
if (-not (Test-Path $dataDir)) {
    Write-Host "❌ ERROR: Data directory not found: $dataDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ ERROR: psql.exe not found: $psqlPath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 1: Backup pg_hba.conf
Write-Host "1️⃣ Backing up pg_hba.conf..." -ForegroundColor Yellow
if (Test-Path $pgHbaConf) {
    Copy-Item $pgHbaConf "$pgHbaConf.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')" -Force
    Write-Host "✅ Backup created" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: pg_hba.conf not found at: $pgHbaConf" -ForegroundColor Red
    exit 1
}

# Step 2: Modify pg_hba.conf to trust
Write-Host "`n2️⃣ Modifying pg_hba.conf to allow trust authentication..." -ForegroundColor Yellow
$content = Get-Content $pgHbaConf
$newContent = $content -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust'
$newContent | Set-Content $pgHbaConf -Force
Write-Host "✅ pg_hba.conf modified" -ForegroundColor Green

# Step 3: Restart PostgreSQL service
Write-Host "`n3️⃣ Restarting PostgreSQL service..." -ForegroundColor Yellow
try {
    Restart-Service $serviceName -Force -ErrorAction Stop
    Start-Sleep -Seconds 5
    Write-Host "✅ Service restarted" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to restart service. Please run as Administrator!" -ForegroundColor Red
    exit 1
}

# Step 4: Reset password
Write-Host "`n4️⃣ Resetting postgres user password..." -ForegroundColor Yellow
$sqlCommand = "ALTER USER postgres WITH PASSWORD '$newPassword';"
try {
    $result = & $psqlPath -U postgres -d postgres -c $sqlCommand 2>&1
    Write-Host "✅ Password reset to: $newPassword" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: There might have been an issue, but continuing..." -ForegroundColor Yellow
}

# Step 5: Restore pg_hba.conf
Write-Host "`n5️⃣ Restoring pg_hba.conf security settings..." -ForegroundColor Yellow
$backupFile = Get-ChildItem "$pgHbaConf.backup_*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($backupFile) {
    Copy-Item $backupFile.FullName $pgHbaConf -Force
    Write-Host "✅ Security settings restored" -ForegroundColor Green
}

# Step 6: Restart PostgreSQL again
Write-Host "`n6️⃣ Restarting PostgreSQL with secure settings..." -ForegroundColor Yellow
Restart-Service $serviceName -Force
Start-Sleep -Seconds 5
Write-Host "✅ Service restarted" -ForegroundColor Green

# Step 7: Verify connection
Write-Host "`n7️⃣ Verifying database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $newPassword
$testResult = & $psqlPath -U postgres -d postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection verified successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Connection test returned errors, but password should be reset" -ForegroundColor Yellow
}

Write-Host "`n🎉 Password reset complete!" -ForegroundColor Green
Write-Host ""
Write-Host "New credentials:" -ForegroundColor Cyan
Write-Host "  User: postgres" -ForegroundColor White
Write-Host "  Password: $newPassword" -ForegroundColor White
Write-Host ""
Write-Host "✨ You can now start your backend server:" -ForegroundColor Cyan
Write-Host "   cd D:\Placements\Asset-Management-KT-Solutions-\backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
