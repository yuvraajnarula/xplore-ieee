@echo off
REM Health check script for Quantum Identity System (Windows)
REM This script checks the health of all services

echo 🏥 Quantum Identity System Health Check
echo ======================================

echo.
echo 🐳 Docker Container Status:
echo ---------------------------

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    exit /b 1
)

REM Check all containers
echo Checking containers...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 🌐 Service Health Checks:
echo -------------------------

REM Check backend services
echo Checking Trust Calculator API...
curl -s -o nul -w "%%{http_code}" http://localhost:8001/docs | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Trust Calculator API - Healthy
) else (
    echo ❌ Trust Calculator API - Unhealthy
)

echo Checking Quantum Oracle API...
curl -s -o nul -w "%%{http_code}" http://localhost:8002/docs | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Quantum Oracle API - Healthy
) else (
    echo ❌ Quantum Oracle API - Unhealthy
)

echo Checking Temporal Scheduler...
curl -s -o nul -w "%%{http_code}" http://localhost:8003/docs | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Temporal Scheduler - Healthy
) else (
    echo ❌ Temporal Scheduler - Unhealthy
)

echo Checking Context Analyzer...
curl -s -o nul -w "%%{http_code}" http://localhost:8004/docs | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Context Analyzer - Healthy
) else (
    echo ❌ Context Analyzer - Unhealthy
)

echo Checking Offline Quantum Cache...
curl -s -o nul -w "%%{http_code}" http://localhost:8005/docs | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Offline Quantum Cache - Healthy
) else (
    echo ❌ Offline Quantum Cache - Unhealthy
)

echo.
echo 🎨 Frontend Services:
echo --------------------

echo Checking Quantum Wallet UI...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Quantum Wallet UI - Healthy
) else (
    echo ❌ Quantum Wallet UI - Unhealthy
)

echo Checking Biometric Capture...
curl -s -o nul -w "%%{http_code}" http://localhost:3001 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Biometric Capture - Healthy
) else (
    echo ❌ Biometric Capture - Unhealthy
)

echo Checking Quantum Verifier Portal...
curl -s -o nul -w "%%{http_code}" http://localhost:3002 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Quantum Verifier Portal - Healthy
) else (
    echo ❌ Quantum Verifier Portal - Unhealthy
)

echo.
echo 📊 Monitoring Services:
echo ----------------------

echo Checking Prometheus...
curl -s -o nul -w "%%{http_code}" http://localhost:9090 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Prometheus - Healthy
) else (
    echo ❌ Prometheus - Unhealthy
)

echo Checking Grafana...
curl -s -o nul -w "%%{http_code}" http://localhost:3003 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Grafana - Healthy
) else (
    echo ❌ Grafana - Unhealthy
)

echo.
echo 🔍 Database Connectivity:
echo ------------------------

echo Checking PostgreSQL connection...
docker exec xplore-ieee_postgres_1 pg_isready -U quantum_user -d quantum_identity >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL - Connected
) else (
    echo ❌ PostgreSQL - Connection failed
)

echo Checking Redis connection...
docker exec xplore-ieee_redis_1 redis-cli ping | findstr "PONG" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis - Connected
) else (
    echo ❌ Redis - Connection failed
)

echo.
echo 📈 System Resources:
echo -------------------

echo Docker containers:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo Memory usage:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo.
echo 💡 Troubleshooting Tips:
echo ----------------------
echo • If services are unhealthy, check logs: docker-compose logs [service-name]
echo • If containers aren't running, restart: docker-compose restart [service-name]
echo • If database issues, reset: docker-compose down -v ^&^& docker-compose up -d
echo • For frontend issues, rebuild: docker-compose build [service-name]
