@echo off
REM Generate secure secrets for Quantum Identity System (Windows)
REM This script generates cryptographically secure secrets for production use

echo 🔐 Generating Secure Secrets for Quantum Identity System
echo ======================================================

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found. Please run setup-env.bat first.
    exit /b 1
)

echo 📝 Generating new secrets...

REM Generate SECRET_KEY using PowerShell
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 0)"') do set SECRET_KEY=%%i
echo Generated SECRET_KEY: %SECRET_KEY:~0,8%...

REM Generate JWT_SECRET_KEY using PowerShell
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 0)"') do set JWT_SECRET_KEY=%%i
echo Generated JWT_SECRET_KEY: %JWT_SECRET_KEY:~0,8%...

REM Generate database password using PowerShell
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(16, 0)"') do set DB_PASSWORD=%%i
echo Generated DB_PASSWORD: %DB_PASSWORD:~0,8%...

REM Generate Grafana password using PowerShell
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(12, 0)"') do set GRAFANA_PASSWORD=%%i
echo Generated GRAFANA_PASSWORD: %GRAFANA_PASSWORD:~0,4%...

REM Update .env file using PowerShell
echo 📝 Updating .env file...
powershell -command "(Get-Content .env) -replace 'SECRET_KEY=.*', 'SECRET_KEY=%SECRET_KEY%' | Set-Content .env"
powershell -command "(Get-Content .env) -replace 'JWT_SECRET_KEY=.*', 'JWT_SECRET_KEY=%JWT_SECRET_KEY%' | Set-Content .env"
powershell -command "(Get-Content .env) -replace 'POSTGRES_PASSWORD=.*', 'POSTGRES_PASSWORD=%DB_PASSWORD%' | Set-Content .env"
powershell -command "(Get-Content .env) -replace 'GRAFANA_PASSWORD=.*', 'GRAFANA_PASSWORD=%GRAFANA_PASSWORD%' | Set-Content .env"

echo ✅ Secrets generated and updated in .env file
echo.
echo ⚠️  IMPORTANT SECURITY NOTES:
echo • Keep your .env file secure and never commit it to version control
echo • These secrets are now in your .env file - restart services to apply changes
echo • For production, consider using a secret management system
echo.
echo 🔄 To apply changes:
echo    docker-compose restart
