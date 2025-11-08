@echo off
echo ============================================
echo PostgreSQL Authentication Fix Launcher
echo ============================================
echo.
echo This will launch the fix script with Administrator privileges.
echo Please click "Yes" when prompted by Windows UAC.
echo.
pause

powershell -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -NoExit -File \"%~dp0fix-postgres-auth.ps1\"' -Verb RunAs"

echo.
echo The fix script has been launched in a new Administrator window.
echo Please check that window for progress.
echo.
pause
