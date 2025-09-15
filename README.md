# Zillionid - Quantum Identity System (MVP)

## 🔹 Overview
This project is an **MVP for a quantum-resilient digital identity system**.  
We combine **quantum-inspired consensus**, **biometric integration**, and a **dynamic trust engine** to ensure secure, tamper-resistant identity verification.

The system is modular and future-ready:
-  Classical + Quantum Simulation (via [Cirq](https://quantumai.google/cirq))  
-  Dynamic Trust Engine with entropy-based scoring  
-  Wallet layer (identity + trust visualization)  
-  Verifier portal (real-time trust & consensus checks)  
-  Planned: holographic rendering, offline quantum cache, swarm consensus

---

## 🐳 Docker Setup (Recommended)

### Quick Start
```bash
# 1. Clone the repository
git clone <repository-url>
cd xplore-ieee

# 2. Set up environment variables
cp env.example .env
# Edit .env with your configuration (see Environment Configuration section below)

# 3. Start all services
docker-compose up -d

# 4. Access the applications
# - Quantum Wallet UI: http://localhost:3000
# - Biometric Capture: http://localhost:3001  
# - Quantum Verifier Portal: http://localhost:3002
# - Trust Calculator API: http://localhost:8001/docs
# - Quantum Oracle API: http://localhost:8002/docs
# - Temporal Scheduler: http://localhost:8003/docs
# - Context Analyzer: http://localhost:8004/docs
# - Offline Quantum Cache: http://localhost:8005/docs
# - Grafana Monitoring: http://localhost:3003 (admin/admin123)
```

### Development Mode
```bash
# Start with hot reload for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Environment Configuration

#### Quick Setup (Automated)
```bash
# Linux/macOS
chmod +x scripts/*.sh
./scripts/setup-env.sh

# Windows
scripts\setup-env.bat
```

#### Manual Setup
Create a `.env` file from the provided `env.example` template:

```bash
# Linux/macOS
cp env.example .env

# Windows
copy env.example .env
```

#### Required Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | `quantum_pass_secure_123` |
| `SECRET_KEY` | JWT secret key | `your-super-secret-key-here` |
| `JWT_SECRET_KEY` | JWT signing key | `your-jwt-secret-key-here` |
| `ETH_RPC_URL` | Ethereum RPC endpoint | `https://sepolia.infura.io/v3/YOUR_PROJECT_ID` |
| `ORACLE_PRIVATE_KEY` | Private key for blockchain | `0x1234...` |
| `TRUSTFABRIC_CONTRACT` | Smart contract address | `0x1234567890123456789012345678901234567890` |

#### Optional Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `GRAFANA_PASSWORD` | `admin123` | Grafana admin password |
| `DEBUG` | `true` | Enable debug mode |
| `LOG_LEVEL` | `INFO` | Logging level |
| `QUANTUM_SIMULATOR_BACKEND` | `simulator` | Quantum simulator backend |
| `MAX_QUBITS` | `10` | Maximum qubits for simulation |
| `TRUST_DECAY_RATE` | `0.9` | Trust score decay rate |
| `MIN_TRUST_THRESHOLD` | `0.3` | Minimum trust threshold |
| `MAX_TRUST_SCORE` | `1.0` | Maximum trust score |

#### Environment Validation
```bash
# Linux/macOS
./scripts/validate-env.sh

# Windows
scripts\validate-env.bat
```

#### Generate Secure Secrets
```bash
# Linux/macOS
./scripts/generate-secrets.sh

# Windows
scripts\generate-secrets.bat
```

### Service Management

#### Basic Commands
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d [service-name]

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild services
docker-compose build [service-name]
```

#### Health Monitoring
```bash
# Run health check
./scripts/health-check.sh

# Windows
scripts\health-check.bat
```

#### Development Commands
```bash
# Start with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Rebuild and start
docker-compose up --build

# View service status
docker-compose ps

# Execute commands in running container
docker-compose exec [service-name] [command]

# Access database
docker-compose exec postgres psql -U quantum_user -d quantum_identity
```

## 🔧 Manual Installation (Alternative)

If you prefer to run without Docker:

```bash
# 1. Set up Python environment
conda create -n quantum-identity python=3.11
conda activate quantum-identity
pip install -r requirements.txt

# 2. Set up databases
# Install PostgreSQL and Redis locally
# Create database: quantum_identity

# 3. Install Node.js dependencies
cd wallet/quantum-wallet-ui && npm install
cd ../biometric-capture && npm install  
cd ../../verifier/quantum-verifier-portal && npm install

# 4. Start services (in separate terminals)
uvicorn services.trust_calc.calc:app --host 0.0.0.0 --port 8001 --reload
uvicorn services.quantum_oracle_api.server:app --host 0.0.0.0 --port 8002 --reload
uvicorn services.temporal_scheduler.app.main:app --host 0.0.0.0 --port 8003 --reload
uvicorn verifier.context-analyser.server:app --host 0.0.0.0 --port 8004 --reload
uvicorn verifier.offline-quantum-cache.app.main:app --host 0.0.0.0 --port 8005 --reload

# 5. Start frontend applications
cd wallet/quantum-wallet-ui && npm run dev
cd wallet/biometric-capture && npm run dev
cd verifier/quantum-verifier-portal && npm run dev
```

## 🏗️ Docker Architecture

The system is containerized with the following services:

### Backend Services (Python/FastAPI)
- **trust-calculator** (Port 8001): Core trust computation engine
- **quantum-oracle** (Port 8002): Quantum operations and fidelity checks  
- **temporal-scheduler** (Port 8003): Time-locked execution system
- **context-analyzer** (Port 8004): Context-aware verification
- **offline-quantum-cache** (Port 8005): Offline quantum state storage

### Frontend Services (React/Vite)
- **quantum-wallet-ui** (Port 3000): Main wallet interface
- **biometric-capture** (Port 3001): Biometric data collection
- **quantum-verifier-portal** (Port 3002): Verification dashboard

### Infrastructure
- **postgres** (Port 5432): Primary database
- **redis** (Port 6379): Caching and job queue
- **prometheus** (Port 9090): Metrics collection
- **grafana** (Port 3003): Monitoring dashboard

### Data Persistence
- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis cache data
- `grafana_data`: Grafana configuration and dashboards

## 🔧 Troubleshooting

### Common Issues

**1. Port Conflicts**
```bash
# Check if ports are in use
netstat -tulpn | grep :8001
# Stop conflicting services or change ports in docker-compose.yml
```

**2. Database Connection Issues**
```bash
# Check database logs
docker-compose logs postgres
# Reset database
docker-compose down -v
docker-compose up -d postgres
```

**3. Environment Variables Not Loading**
```bash
# Verify .env file exists and has correct format
cat .env
# Restart services after changing .env
docker-compose restart
```

**4. Frontend Build Issues**
```bash
# Rebuild frontend containers
docker-compose build quantum-wallet-ui
docker-compose up -d quantum-wallet-ui
```

**5. Service Health Checks Failing**
```bash
# Check service logs
docker-compose logs [service-name]
# Verify service is responding
curl http://localhost:8001/health
```

### Development Tips

**Hot Reload Issues:**
- Use `docker-compose.dev.yml` for development
- Ensure volumes are properly mounted
- Check file permissions

**Database Migrations:**
```bash
# Run Alembic migrations
docker-compose exec temporal-scheduler alembic upgrade head
docker-compose exec offline-quantum-cache alembic upgrade head
```

**Monitoring Setup:**
- Access Grafana at http://localhost:3003
- Default credentials: admin/admin123
- Import dashboards from `monitoring/grafana/` directory

## 🚀 Complete Setup Guide

### Step 1: Prerequisites
- Docker Desktop installed and running
- Git installed
- At least 4GB RAM available for Docker

### Step 2: Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd xplore-ieee

# Run automated setup
# Linux/macOS:
chmod +x scripts/*.sh
./scripts/setup-env.sh

# Windows:
scripts\setup-env.bat
```

### Step 3: Configure Environment
1. Edit `.env` file with your configuration
2. Set up Ethereum RPC URL (Infura, Alchemy, or local node)
3. Configure smart contract addresses
4. Set up private keys for blockchain transactions

### Step 4: Validate Configuration
```bash
# Linux/macOS:
./scripts/validate-env.sh

# Windows:
scripts\validate-env.bat
```

### Step 5: Start the System
```bash
# Start all services
docker-compose up -d

# Check health
./scripts/health-check.sh
# Windows: scripts\health-check.bat
```

### Step 6: Access Applications
- **Quantum Wallet UI**: http://localhost:3000
- **Biometric Capture**: http://localhost:3001
- **Quantum Verifier Portal**: http://localhost:3002
- **API Documentation**: http://localhost:8001/docs
- **Monitoring Dashboard**: http://localhost:3003

## 📁 Project Structure

```
xplore-ieee/
├──  blockchain/          # Smart contracts and Web3 integration
├──  core/               # Core quantum identity logic
├──  demos/              # Demo applications
├──  monitoring/         # Prometheus and Grafana configs
├──  services/           # Backend API services
├──  verifier/           # Verification and analysis tools
├──  wallet/             # Frontend wallet applications
├──  scripts/            # Setup and utility scripts
├──  docker-compose.yml  # Main Docker orchestration
├──  docker-compose.dev.yml # Development overrides
├──  Dockerfile.python   # Python services container
├──  Dockerfile.react    # React applications container
├──  env.example         # Environment template
└──  README.md           # This file
```

##  Current MVP Scope

### 1. **Core**
- **Entanglement Sharding (`entanglement_sharding.py`)**  
  Simulates quantum entangled shards using **Cirq**.  
  - Models consensus via correlated collapse (e.g., `0000` or `1111`)  
  - Tampering / early unlock detection  
  - Outputs *agreement rate* → input for Trust Engine  

- **Temporal Locks (`temporal_locks.py`)**  
  Adds time-based restrictions on shard participation.  
  Prevents replay/tampering attacks by locking nodes until expiry.

- **Biometric Quantum (`biometric_quantum.py`)**  
  Converts biometric data → normalized quantum-like features.  
  Used as an input fidelity signal for trust scoring.

---

### 2. **Services**
- **Trust Calculator (FastAPI)**  
  - `POST /compute-trust` → Update trust score for an identity  
  - `GET /trust/{id}` → Retrieve trust score  
  - `GET /rank` → Ranked list of identities  
  - `POST /bulk-update` → Batch trust updates  

  Powered by the **Dynamic Trust Engine**:
  - Aggregates signals: `agreement_rate`, `biometric_fidelity`, `witness_score`  
  - Entropy-aware scoring (detects inconsistencies across signals)  
  - Decay model (trust fades over time without reaffirmation)  

---

### 3. **Wallet Layer**
- **Quantum Wallet UI (React)**  
  Displays enrolled identities and their **live trust scores**.  
  Simple badges & charts (holographic rendering planned later).  

- **Biometric Capture (Stub)**  
  For MVP: Upload an image → hashed → sent to trust calculator.  
  No raw biometric stored.  

---

### 4. **Verifier Layer**
- **Quantum Verifier Portal (Web Dashboard)**  
  Allows a verifier (e.g., *bank KYC officer*) to:  
  - Input identity ID  
  - Fetch trust score & consensus state  
  - Check whether “consensus achieved”  

---

## Workflow (MVP Demo)
1. User provides **biometric sample** (image upload → hash).  
2. Cirq-based **entanglement sharding** simulates agreement rate.  
3. **Dynamic Trust Engine** computes trust using:  
   - Agreement Rate  
   - Biometric Fidelity  
   - Witness Score  
   - Entropy factor + decay  
4. Trust score is updated in **Trust Calculator Service**.  
5. Wallet UI fetches scores → shows them in real-time.  
6. Verifier Portal checks trust & consensus for external validation.

---

## 🔹 Example Trust Score
```json
{
  "identity_id": "alice",
  "trust_score": 0.546,
  "updated_at": 1736050973.23
}
```
## folder structure
```
quantum-identity-system/
├── core/
│   ├── quantum-engine/          # Qiskit-based quantum simulators
│   │   ├── entanglement-sharding.py
│   │   ├── temporal-locks.py
│   │   ├── quantum-consensus.py
│   │   └── biometric-quantum.py
│   ├── mesh-network/            # QMesh implementation
│   │   ├── quantum-oracle.py
│   │   ├── consensus-cluster.py
│   │   └── witness-validator.py
│   └── identity-core/           # Core identity logic
│       ├── holographic-identity.py
│       ├── dynamic-trust.py
│       └── swarm-coordinator.py
├── blockchain/
│   ├── contracts/
│   │   ├── QuantumDIDRegistry.sol
│   │   ├── TemporalCredentials.sol
│   │   ├── TrustFabric.sol
│   │   └── SwarmConsensus.sol
│   └── quantum-web3/           # Quantum-enhanced Web3 interface
├── services/
│   ├── quantum-oracle-api/     # REST API for quantum operations
│   ├── biometric-processor/    # Real-time biometric → quantum conversion
│   ├── temporal-scheduler/     # Time-lock automation
│   └── trust-calculator/       # Dynamic trust computation
├── wallet/
│   ├── quantum-wallet-ui/      # React app with quantum visualizations
│   ├── holographic-renderer/   # 3D identity visualization
│   └── biometric-capture/      # Camera/mic integration
├── verifier/
│   ├── quantum-verifier-portal/
│   ├── offline-quantum-cache/   # Quantum state snapshots for offline use
│   └── context-analyzer/        # Smart verification based on use case
├── demos/
│   ├── bb84-simulator/          # Visual QKD demonstration
│   ├── identity-attack-sim/     # Show quantum attack resistance
│   └── swarm-demo/              # Identity swarm visualization
└── monitoring/
    ├── quantum-metrics/         # Quantum-specific system monitoring
    ├── trust-analytics/         # Trust pattern analysis
    └── threat-prediction/       # ML-based threat forecasting
```
