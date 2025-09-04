"""
Computes dynamic trust scores:
- Uses consensus agreement, biometric fidelity, witness validations
- Produces adaptive trust weights per identity
"""

import numpy as np


class DynamicTrustEngine:
    def __init__(self, decay: float = 0.95):
        self.decay = decay
        self.trust_registry = {}

    def update_trust(self, identity_id, agreement_rate, bio_fid, witness_score):
        """
        Aggregate trust components:
        - agreement_rate: quantum consensus reliability (0..1)
        - bio_fid: biometric fidelity (0..1)
        - witness_score: external validator confidence (0..1)
        """
        base_score = 0.5 * agreement_rate + 0.3 * bio_fid + 0.2 * witness_score
        prev_score = self.trust_registry.get(identity_id, 0.5)

        # Apply decay for temporal dynamics
        new_score = self.decay * prev_score + (1 - self.decay) * base_score
        self.trust_registry[identity_id] = new_score
        return new_score

    def get_trust(self, identity_id):
        return self.trust_registry.get(identity_id, 0.0)

    def rank_identities(self):
        """Return identities ranked by trust"""
        return sorted(self.trust_registry.items(), key=lambda x: x[1], reverse=True)
