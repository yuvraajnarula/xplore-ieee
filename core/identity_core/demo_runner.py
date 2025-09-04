"""
Demonstrates holographic identity + dynamic trust + swarm coordination
"""
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))


import numpy as np
from holographic_identity import HolographicIdentity
from  dynamic_trust import DynamicTrustEngine
from  swarm_coord import SwarmCoordinator


def run_demo():
    identities = []
    biometric_refs = {
        "alice": [0.2, 0.5, 0.1, 0.9],
        "bob": [0.4, 0.3, 0.7, 0.6],
        "carol": [0.1, 0.9, 0.2, 0.4],
        "dave": [0.3, 0.3, 0.3, 0.3],
        "eve": [0.8, 0.1, 0.6, 0.2],
    }

    holograms = {}
    for name, vec in biometric_refs.items():
        h = HolographicIdentity(identity_id=name, n_qubits=4)
        h.enroll(vec)
        holograms[name] = h
        identities.append(name)

    print("\n--- Enrolled Identities ---")
    for name in identities:
        print(f"{name} enrolled")

    print("\n--- Biometric Verification ---")
    test_samples = {
        "alice": [0.21, 0.48, 0.09, 0.91],  # close -> high fidelity
        "bob": [0.7, 0.1, 0.2, 0.9],        # far -> lower fidelity
        "carol": [0.1, 0.88, 0.25, 0.39],
        "dave": [0.35, 0.31, 0.28, 0.29],
        "eve": [0.79, 0.12, 0.58, 0.19],
    }

    bio_fidelities = {}
    for name, sample in test_samples.items():
        fid = holograms[name].verify(sample)
        bio_fidelities[name] = fid
        print(f"{name}: fidelity = {fid:.3f}")

    trust_engine = DynamicTrustEngine(decay=0.9)

    print("\n--- Updating Trust Scores ---")
    for name in identities:
        agreement_rate = np.random.uniform(0.9, 1.0)  # from quantum consensus
        bio_fid = bio_fidelities[name]                
        witness_score = np.random.uniform(0.8, 1.0)   # from witness validators

        trust = trust_engine.update_trust(name, agreement_rate, bio_fid, witness_score)
        if isinstance(trust, (list, tuple, np.ndarray)):
            trust = float(np.mean(trust))
        holograms[name].update_trust(trust)
        print(f"{name}: trust = {trust:.3f}")

    swarm = SwarmCoordinator(swarm_size=5)
    swarm.form_swarm("swarm-1", identities)

    print("\n--- Swarm Verification ---")
    report = swarm.verify_swarm("swarm-1", trust_engine)
    print(f"Swarm {report['swarm_id']} avg trust = {report['avg_trust']:.3f}")
    print(f"Consensus = {report['consensus']}")
    print("Members:")
    for member, score in report["members"]:
        print(f"  {member}: {score:.3f}")


if __name__ == "__main__":
    run_demo()
