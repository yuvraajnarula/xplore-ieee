set -e

echo "🏥 Quantum Identity System Health Check"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

# Function to check Docker container status
check_container() {
    local container_name=$1
    echo -n "Checking container $container_name... "
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

echo ""
echo "🐳 Docker Container Status:"
echo "---------------------------"

# Check all containers
check_container "xplore-ieee_postgres_1" || check_container "xplore-ieee-postgres-1"
check_container "xplore-ieee_redis_1" || check_container "xplore-ieee-redis-1"
check_container "xplore-ieee_trust-calculator_1" || check_container "xplore-ieee-trust-calculator-1"
check_container "xplore-ieee_quantum-oracle_1" || check_container "xplore-ieee-quantum-oracle-1"
check_container "xplore-ieee_temporal-scheduler_1" || check_container "xplore-ieee-temporal-scheduler-1"
check_container "xplore-ieee_context-analyzer_1" || check_container "xplore-ieee-context-analyzer-1"
check_container "xplore-ieee_offline-quantum-cache_1" || check_container "xplore-ieee-offline-quantum-cache-1"

echo ""
echo "🌐 Service Health Checks:"
echo "-------------------------"

# Check backend services
check_service "Trust Calculator API" "http://localhost:8001/docs"
check_service "Quantum Oracle API" "http://localhost:8002/docs"
check_service "Temporal Scheduler" "http://localhost:8003/docs"
check_service "Context Analyzer" "http://localhost:8004/docs"
check_service "Offline Quantum Cache" "http://localhost:8005/docs"

echo ""
echo "🎨 Frontend Services:"
echo "--------------------"

# Check frontend services
check_service "Quantum Wallet UI" "http://localhost:3000"
check_service "Biometric Capture" "http://localhost:3001"
check_service "Quantum Verifier Portal" "http://localhost:3002"

echo ""
echo "📊 Monitoring Services:"
echo "----------------------"

check_service "Prometheus" "http://localhost:9090"
check_service "Grafana" "http://localhost:3003"

echo ""
echo "🔍 Database Connectivity:"
echo "------------------------"

# Check database connectivity
echo -n "Checking PostgreSQL connection... "
if docker exec xplore-ieee_postgres_1 pg_isready -U quantum_user -d quantum_identity 2>/dev/null || \
   docker exec xplore-ieee-postgres-1 pg_isready -U quantum_user -d quantum_identity 2>/dev/null; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Connection failed${NC}"
fi

echo -n "Checking Redis connection... "
if docker exec xplore-ieee_redis_1 redis-cli ping 2>/dev/null | grep -q "PONG" || \
   docker exec xplore-ieee-redis-1 redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Connection failed${NC}"
fi

echo ""
echo "📈 System Resources:"
echo "-------------------"

# Check system resources
echo "Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Memory usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "💡 Troubleshooting Tips:"
echo "----------------------"
echo "• If services are unhealthy, check logs: docker-compose logs [service-name]"
echo "• If containers aren't running, restart: docker-compose restart [service-name]"
echo "• If database issues, reset: docker-compose down -v && docker-compose up -d"
echo "• For frontend issues, rebuild: docker-compose build [service-name]"