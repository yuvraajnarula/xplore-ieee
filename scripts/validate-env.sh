#!/bin/bash

# Environment validation script for Quantum Identity System
# This script validates that all required environment variables are properly set

set -e

echo "🔍 Validating Environment Configuration"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please run: cp env.example .env"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Source the .env file
set -a
source .env
set +a

# Function to check if variable is set and not empty
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_required=${2:-true}
    
    if [ -z "$var_value" ] || [ "$var_value" = "your-${var_name,,}-here" ] || [ "$var_value" = "YOUR_${var_name}_HERE" ]; then
        if [ "$is_required" = true ]; then
            echo -e "${RED}❌ $var_name is not set or using default value${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  $var_name is not set (optional)${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ $var_name is set${NC}"
        return 0
    fi
}

echo ""
echo "🔧 Required Configuration:"
echo "-------------------------"

# Check required variables
REQUIRED_VARS=(
    "POSTGRES_PASSWORD"
    "SECRET_KEY"
    "JWT_SECRET_KEY"
    "ETH_RPC_URL"
    "ORACLE_PRIVATE_KEY"
    "TRUSTFABRIC_CONTRACT"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_var "$var" true; then
        MISSING_VARS+=("$var")
    fi
done

echo ""
echo "🔧 Optional Configuration:"
echo "-------------------------"

# Check optional variables
OPTIONAL_VARS=(
    "GRAFANA_PASSWORD"
    "DEBUG"
    "LOG_LEVEL"
    "QUANTUM_SIMULATOR_BACKEND"
    "MAX_QUBITS"
    "TRUST_DECAY_RATE"
    "MIN_TRUST_THRESHOLD"
    "MAX_TRUST_SCORE"
    "BIOMETRIC_HASH_ALGORITHM"
    "BIOMETRIC_SALT_ROUNDS"
    "WORKER_CONCURRENCY"
    "SCHEDULER_TICK_INTERVAL"
    "ANALYSIS_WINDOW_HOURS"
    "SUSPICIOUS_ACTIVITY_THRESHOLD"
)

for var in "${OPTIONAL_VARS[@]}"; do
    check_var "$var" false
done

echo ""
echo "🔍 Validation Results:"
echo "---------------------"

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All required environment variables are properly configured!${NC}"
    echo ""
    echo "🚀 You can now start the system with:"
    echo "   docker-compose up -d"
    exit 0
else
    echo -e "${RED}❌ Missing or invalid configuration for:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📝 Please update your .env file with proper values:"
    echo "   1. Edit .env file"
    echo "   2. Replace placeholder values with actual configuration"
    echo "   3. Run this script again to validate"
    echo ""
    echo "💡 For help with specific variables, see the comments in env.example"
    exit 1
fi
