"""
In classical distributed systems, consensus ensures that all nodes agree on
a shared state, even if some are faulty or slow.

In a quantum setting,
    Ensure all shards collapse into correlated results basically `0000` or `1111`
    Detect Interference if a node is tampered with early or unlocked too soon
    Use agreement rate as consensus indicators
"""

from entanglement_sharding import EntangledShardsSystem
from temporal_locks import TemporalLockManager
from datetime import datetime, timedelta
from biometric_quantum import BiometricEncoder, fidelity
import time 

def run_quantum_consensus():
    NUM_SHARDS = 3
    BASIS = "Z"
    REPETITIONS = 1000
    DEPOLARIZING_PROB = 0.01

    lock_mgr = TemporalLockManager()
    lock_mgr.add_rltv_lock(shard_idx=1,duration=10)
    lock_mgr.add_rltv_lock(shard_idx=2, duration=5)
    
    print("Temporal locks initialized.")
    print(f"Node 1 locked until: {lock_mgr.locks[1]}")
    print(f"Node 2 locked until: {lock_mgr.locks[2]}")
    print("Waiting 6 seconds before running consensus...\n")

    time.sleep(6)

    curr = datetime.now() 
    
    tamper_indxs = [
        i for i in range(NUM_SHARDS)
        if not lock_mgr.is_locked(i, curr)
    ]

    sys = EntangledShardsSystem(
        num_shards=NUM_SHARDS,
        basis=BASIS,
        repetitions=REPETITIONS,
        tamper=tuple(tamper_indxs),
        depolarizing_prob=DEPOLARIZING_PROB
    )

    sys.describe()

    res = sys.run()
    print("\n--- Quantum Consensus Report ---")
    print(f"Agreement Rate: {res['agreement_rate']:.4f}")
    print(f"Bitstring Histogram: {res['bitstring_histogram']}")
    print("Pairwise Correlations:")
    for pair, corr in res['pairwise_zz'].items():
        print(f"  {pair}: {corr:.3f}")
    
    encoder = BiometricEncoder(nqubits=3)

    biometric_live = [0.2, 0.5, 0.1, 0.9]
    biometric_ref = [0.21, 0.48, 0.09, 0.91]

    state_live, _ = encoder.encode(biometric_live)
    state_ref, _ = encoder.encode(biometric_ref)

    bio_fid = fidelity(state_live, state_ref)
    print(f"\nBiometric Fidelity: {bio_fid:.4f}")

    consensus = (
        res['agreement_rate'] > 0.9
        and all(abs(corr) > 0.85 for corr in res['pairwise_zz'].values())
        and bio_fid > 0.9
    )

    
    print("\n Consensus Achieved!" if consensus else "\n Consensus Broken!")

if __name__ == '__main__':
    run_quantum_consensus()