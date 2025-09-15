#!/bin/bash

# Environment setup script for Quantum Identity System
# This script helps set up the environment for Docker deployment

set -e

echo "🔧 Setting up Quantum Identity System Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Generate random secrets if not set
if ! grep -q "your-super-secret-key-here" .env; then
    echo "🔐 Generating secure secrets..."
    
    # Generate SECRET_KEY
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/your-super-secret-key-here-change-in-production/$SECRET_KEY/" .env
    
    # Generate JWT_SECRET_KEY
    JWT_SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/your-jwt-secret-key-here/$JWT_SECRET_KEY/" .env
    
    # Generate database password
    DB_PASSWORD=$(openssl rand -hex 16)
    sed -i "s/quantum_pass_secure_123/$DB_PASSWORD/" .env
    
    echo "✅ Secure secrets generated and updated in .env"
else
    echo "✅ Secrets already configured in .env"
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed."

# Check if required environment variables are set
echo "🔍 Checking environment configuration..."

REQUIRED_VARS=("ETH_RPC_URL" "ORACLE_PRIVATE_KEY" "TRUSTFABRIC_CONTRACT")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "YOUR_.*_HERE\|your-.*-here" .env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "⚠️  Please configure the following variables in .env:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Edit .env file and run this script again."
    exit 1
fi

echo "✅ Environment configuration looks good!"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p monitoring/grafana
mkdir -p logs

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the system:"
echo "   docker-compose up -d"
echo ""
echo "🔍 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the system:"
echo "   docker-compose down"
