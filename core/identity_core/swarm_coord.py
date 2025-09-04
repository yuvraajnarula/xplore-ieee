"""
Coordinates identity swarms:
- Groups identities into swarms
- Runs distributed verification
- Aggregates swarm consensus states
"""

import random


class SwarmCoordinator:
    def __init__(self, swarm_size: int = 5):
        self.swarm_size = swarm_size
        self.swarms = {}

    def form_swarm(self, swarm_id, identities):
        """Create a new swarm with a set of identities"""
        if len(identities) < self.swarm_size:
            raise ValueError(f"Need at least {self.swarm_size} identities for a swarm")
        self.swarms[swarm_id] = identities[:self.swarm_size]

    def verify_swarm(self, swarm_id, trust_engine):
        """Run swarm-wide consensus verification"""
        if swarm_id not in self.swarms:
            raise ValueError("Swarm not found!")

        ids = self.swarms[swarm_id]
        trust_scores = [trust_engine.get_trust(i) for i in ids]

        avg_trust = sum(trust_scores) / len(trust_scores)
        consensus = avg_trust > 0.7

        return {
            "swarm_id": swarm_id,
            "avg_trust": avg_trust,
            "consensus": consensus,
            "members": list(zip(ids, trust_scores))
        }

    def list_swarms(self):
        return self.swarms

