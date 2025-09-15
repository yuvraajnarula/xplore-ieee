#!/bin/bash

# Generate secure secrets for Quantum Identity System
# This script generates cryptographically secure secrets for production use

set -e

echo "🔐 Generating Secure Secrets for Quantum Identity System"
echo "======================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup-env.sh first."
    exit 1
fi

echo "📝 Generating new secrets..."

# Generate SECRET_KEY (32 bytes = 64 hex characters)
SECRET_KEY=$(openssl rand -hex 32)
echo "Generated SECRET_KEY: ${SECRET_KEY:0:8}..."

# Generate JWT_SECRET_KEY (32 bytes = 64 hex characters)
JWT_SECRET_KEY=$(openssl rand -hex 32)
echo "Generated JWT_SECRET_KEY: ${JWT_SECRET_KEY:0:8}..."

# Generate database password (16 bytes = 32 hex characters)
DB_PASSWORD=$(openssl rand -hex 16)
echo "Generated DB_PASSWORD: ${DB_PASSWORD:0:8}..."

# Generate Grafana password (12 characters)
GRAFANA_PASSWORD=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-12)
echo "Generated GRAFANA_PASSWORD: ${GRAFANA_PASSWORD:0:4}..."

# Update .env file
echo "📝 Updating .env file..."

# Use sed with different syntax for different OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
    sed -i '' "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET_KEY/" .env
    sed -i '' "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
    sed -i '' "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASSWORD/" .env
else
    # Linux
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
    sed -i "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET_KEY/" .env
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
    sed -i "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASSWORD/" .env
fi

echo "✅ Secrets generated and updated in .env file"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "• Keep your .env file secure and never commit it to version control"
echo "• These secrets are now in your .env file - restart services to apply changes"
echo "• For production, consider using a secret management system"
echo ""
echo "🔄 To apply changes:"
echo "   docker-compose restart"
