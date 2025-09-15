@echo off
REM Environment setup script for Quantum Identity System (Windows)
REM This script helps set up the environment for Docker deployment

echo 🔧 Setting up Quantum Identity System Environment...

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please edit it with your configuration.
) else (
    echo ✅ .env file already exists.
)

REM Generate random secrets if not set
findstr /C:"your-super-secret-key-here" .env >nul
if %errorlevel% equ 0 (
    echo 🔐 Generating secure secrets...
    
    REM Generate SECRET_KEY (using PowerShell for random generation)
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 0)"') do set SECRET_KEY=%%i
    powershell -command "(Get-Content .env) -replace 'your-super-secret-key-here-change-in-production', '%SECRET_KEY%' | Set-Content .env"
    
    REM Generate JWT_SECRET_KEY
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 0)"') do set JWT_SECRET_KEY=%%i
    powershell -command "(Get-Content .env) -replace 'your-jwt-secret-key-here', '%JWT_SECRET_KEY%' | Set-Content .env"
    
    REM Generate database password
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(16, 0)"') do set DB_PASSWORD=%%i
    powershell -command "(Get-Content .env) -replace 'quantum_pass_secure_123', '%DB_PASSWORD%' | Set-Content .env"
    
    echo ✅ Secure secrets generated and updated in .env
) else (
    echo ✅ Secrets already configured in .env
)

REM Check Docker installation
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed.

REM Check if required environment variables are set
echo 🔍 Checking environment configuration...

findstr /C:"YOUR_INFURA_PROJECT_ID" .env >nul
if %errorlevel% equ 0 (
    echo ⚠️  Please configure ETH_RPC_URL in .env
)

findstr /C:"your-oracle-private-key-here" .env >nul
if %errorlevel% equ 0 (
    echo ⚠️  Please configure ORACLE_PRIVATE_KEY in .env
)

findstr /C:"0x1234567890123456789012345678901234567890" .env >nul
if %errorlevel% equ 0 (
    echo ⚠️  Please configure TRUSTFABRIC_CONTRACT in .env
)

echo ✅ Environment configuration check complete!

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist monitoring\grafana mkdir monitoring\grafana
if not exist logs mkdir logs

echo ✅ Setup complete!
echo.
echo 🚀 To start the system:
echo    docker-compose up -d
echo.
echo 🔍 To view logs:
echo    docker-compose logs -f
echo.
echo 🛑 To stop the system:
echo    docker-compose down
