from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, List
import random
import time

# --- Core service imports (optional, to integrate with demos) ---
from core.quantum_engine.temporal_locks import TemporalLockManager
from core.identity_core.dynamic_trust import DynamicTrustEngine

# --- Ephemeral instances ---
temporal_manager = TemporalLockManager()
engine = DynamicTrustEngine(decay=0.9)

app = FastAPI(title="Quantum Identity Demos")

# --- BB84 QKD Simulator Demo ---
@app.get("/demos/bb84-simulator")
def bb84_simulate(qubits: int = 8):
    """
    Simulate a BB84 QKD session.
    Returns random qubit states and a shared key (simplified ephemeral simulation).
    """
    if qubits <= 0 or qubits > 1024:
        raise HTTPException(status_code=400, detail="qubits must be between 1 and 1024")

    states = [random.choice(["0", "1", "+", "-"]) for _ in range(qubits)]
    key = "".join(random.choice(["0", "1"]) for _ in range(qubits))
    return {"qubits": states, "shared_key": key, "timestamp": time.time()}


# --- Identity Attack Simulation Demo ---
@app.get("/demos/identity-attack-sim")
def identity_attack_sim(identity_id: str = "alice"):
    """
    Simulate quantum identity attack.
    Returns attack success probability and simulated trust effect.
    """
    current_trust = engine.get_trust(identity_id)
    attack_success_prob = random.uniform(0, 1)
    simulated_trust_drop = current_trust * attack_success_prob * 0.5
    new_trust = max(current_trust - simulated_trust_drop, 0.0)

    # Ephemeral update in dynamic engine
    engine.update_trust(identity_id, new_trust, 0.0, 0.0)
    return {
        "identity_id": identity_id,
        "attack_success_prob": attack_success_prob,
        "new_trust_score": new_trust,
        "timestamp": time.time()
    }


# --- Swarm Visualization Demo ---
@app.get("/demos/swarm-demo")
def swarm_demo(num_nodes: int = 10):
    """
    Simulate ephemeral swarm of identities.
    Returns positions and trust scores for visualization.
    """
    if num_nodes <= 0 or num_nodes > 1000:
        raise HTTPException(status_code=400, detail="num_nodes must be between 1 and 1000")

    swarm = []
    for i in range(num_nodes):
        identity_id = f"user_{i}"
        x, y = random.uniform(0, 100), random.uniform(0, 100)
        trust_score = engine.get_trust(identity_id) or random.uniform(0.5, 1.0)
        swarm.append({
            "identity_id": identity_id,
            "position": {"x": x, "y": y},
            "trust_score": trust_score
        })
    return {"swarm": swarm, "timestamp": time.time()}


# --- Quantum Shard Demo Endpoint (Optional) ---
@app.get("/demos/shard-status")
def shard_status(total_shards: int = 50):
    """
    Return locked/unlocked shard status from TemporalLockManager.
    """
    unlocked = temporal_manager.unlocked_shards(total_shards, None)
    locked = total_shards - len(unlocked)
    return {
        "total_shards": total_shards,
        "locked": locked,
        "unlocked": len(unlocked),
        "unlocked_indices": unlocked
    }


@app.get("/demos/health")
def health_check():
    return {"status": "ok", "timestamp": time.time()}
