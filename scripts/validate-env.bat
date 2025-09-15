@echo off
REM Environment validation script for Quantum Identity System (Windows)
REM This script validates that all required environment variables are properly set

echo 🔍 Validating Environment Configuration
echo ======================================

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found
    echo Please run: copy env.example .env
    exit /b 1
)

echo ✅ .env file found

REM Load environment variables from .env file
for /f "usebackq tokens=1,2 delims==" %%a in (.env) do (
    set "%%a=%%b"
)

echo.
echo 🔧 Required Configuration:
echo -------------------------

set MISSING_VARS=0

REM Check required variables
echo Checking POSTGRES_PASSWORD...
if "%POSTGRES_PASSWORD%"=="" (
    echo ❌ POSTGRES_PASSWORD is not set
    set /a MISSING_VARS+=1
) else if "%POSTGRES_PASSWORD%"=="quantum_pass_secure_123" (
    echo ❌ POSTGRES_PASSWORD is using default value
    set /a MISSING_VARS+=1
) else (
    echo ✅ POSTGRES_PASSWORD is set
)

echo Checking SECRET_KEY...
if "%SECRET_KEY%"=="" (
    echo ❌ SECRET_KEY is not set
    set /a MISSING_VARS+=1
) else if "%SECRET_KEY%"=="your-super-secret-key-here-change-in-production" (
    echo ❌ SECRET_KEY is using default value
    set /a MISSING_VARS+=1
) else (
    echo ✅ SECRET_KEY is set
)

echo Checking JWT_SECRET_KEY...
if "%JWT_SECRET_KEY%"=="" (
    echo ❌ JWT_SECRET_KEY is not set
    set /a MISSING_VARS+=1
) else if "%JWT_SECRET_KEY%"=="your-jwt-secret-key-here" (
    echo ❌ JWT_SECRET_KEY is using default value
    set /a MISSING_VARS+=1
) else (
    echo ✅ JWT_SECRET_KEY is set
)

echo Checking ETH_RPC_URL...
if "%ETH_RPC_URL%"=="" (
    echo ❌ ETH_RPC_URL is not set
    set /a MISSING_VARS+=1
) else if "%ETH_RPC_URL%"=="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID" (
    echo ❌ ETH_RPC_URL is using default value
    set /a MISSING_VARS+=1
) else (
    echo ✅ ETH_RPC_URL is set
)

echo Checking ORACLE_PRIVATE_KEY...
if "%ORACLE_PRIVATE_KEY%"=="" (
    echo ❌ ORACLE_PRIVATE_KEY is not set
    set /a MISSING_VARS+=1
) else if "%ORACLE_PRIVATE_KEY%"=="your-oracle-private-key-here" (
    echo ❌ ORACLE_PRIVATE_KEY is using default value
    set /a MISSING_VARS+=1
) else (
    echo ✅ ORACLE_PRIVATE_KEY is set
)

echo Checking TRUSTFABRIC_CONTRACT...
if "%TRUSTFABRIC_CONTRACT%"=="" (
    echo ❌ TRUSTFABRIC_CONTRACT is not set
    set /a MISSING_VARS+=1
) else if "%TRUSTFABRIC_CONTRACT%"=="0x1234567890123456789012345678901234567890" (
    echo ❌ TRUSTFABRIC_CONTRACT is using default value
    set /a MISSING_VARS+=1
) else (
    echo ✅ TRUSTFABRIC_CONTRACT is set
)

echo.
echo 🔧 Optional Configuration:
echo -------------------------

echo Checking GRAFANA_PASSWORD...
if "%GRAFANA_PASSWORD%"=="" (
    echo ⚠️  GRAFANA_PASSWORD is not set (optional)
) else (
    echo ✅ GRAFANA_PASSWORD is set
)

echo Checking DEBUG...
if "%DEBUG%"=="" (
    echo ⚠️  DEBUG is not set (optional)
) else (
    echo ✅ DEBUG is set
)

echo Checking LOG_LEVEL...
if "%LOG_LEVEL%"=="" (
    echo ⚠️  LOG_LEVEL is not set (optional)
) else (
    echo ✅ LOG_LEVEL is set
)

echo.
echo 🔍 Validation Results:
echo ---------------------

if %MISSING_VARS% equ 0 (
    echo ✅ All required environment variables are properly configured!
    echo.
    echo 🚀 You can now start the system with:
    echo    docker-compose up -d
    exit /b 0
) else (
    echo ❌ Missing or invalid configuration for %MISSING_VARS% required variables
    echo.
    echo 📝 Please update your .env file with proper values:
    echo    1. Edit .env file
    echo    2. Replace placeholder values with actual configuration
    echo    3. Run this script again to validate
    echo.
    echo 💡 For help with specific variables, see the comments in env.example
    exit /b 1
)
