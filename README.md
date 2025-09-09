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

## Installation & Running of product
```
git clone 
conda create -n <environment_name> python=3.11
pip install -r requirements.txt
cd wallet/quantum-wallet-ui 
npm install
cd ../biometric-capture 
npm install
cd ../../verifier/quantum-verifier-portal
npm install
```
```run
(at root)
uvicorn services.trust_calc.calc:app --host 0.0.0.0 --port 8001 --reload
uvicorn services.quantum_oracle_api.server:app --host 0.0.0.0 --port 8002 --reload
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

## folder structure
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
