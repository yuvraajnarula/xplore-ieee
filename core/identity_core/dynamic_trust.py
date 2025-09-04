import math
from typing import Dict, List

class DynamicTrustEngine:
    def __init__(self, decay: float = 0.9):
        self.decay = decay
        self._scores: Dict[str, float] = {}

    def _entropy(self, values: List[float]) -> float:
        """
        Shannon entropy on normalized values.
        Ensures higher uncertainty = higher entropy.
        """
        # Normalize to probability distribution
        total = sum(values)
        if total == 0:
            return 1.0  # max uncertainty
        probs = [v / total for v in values if v > 0]
        entropy = -sum(p * math.log2(p) for p in probs)
        # normalize to [0,1]
        return entropy / math.log2(len(values))


    def update_trust(self, identity_id: str, agreement: float, biometric: float, witness: float) -> tuple[float, float]:
        base_score = (0.5 * agreement) + (0.3 * biometric) + (0.2 * witness)

        entropy = self._entropy([agreement, biometric, witness])
        entropy_factor = 1.0 - (0.1 * entropy)
        new_score = base_score * (0.7 + 0.3 * entropy_factor)

        prev = self._scores.get(identity_id, new_score)
        updated = (self.decay * prev) + ((1 - self.decay) * new_score)

        self._scores[identity_id] = updated
        return updated, entropy

    def get_trust(self, identity_id: str) -> float:
        return self._scores.get(identity_id, 0.0)

    def rank_identities(self):
        return sorted(self._scores.items(), key=lambda kv: kv[1], reverse=True)
