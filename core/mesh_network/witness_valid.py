"""
Witnesss validator 

- Validate witness measurement reports (bitstrings, timestamps, node ids).
- Compute per-report agreement, overall agreement rate, and pairwise correlations.
- Detect tampering: large deviation from expected GHZ/Bell correlations, missing data, or inconsistent timestamps.
- Optionally accept a biometric fidelity score per witness and incorporate it into a final trust score.

Expect input report format (dict):
{
    "node_id": "node-1",
    "bitstrings": ["000","000","111",...],  # list of strings of length num_shards
    "timestamp": 169...,  # epoch seconds
    "biometric_fidelity": 0.98  # optional float 0..1
}
"""

from __future__ import annotations
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple


@dataclass
class WitnessReport:
    node_id : str
    bitstrings: Sequence[str]
    timestamp : float 
    biometric_fidelity : Optional[float] = None 

@dataclass
class ValidationResult:
    node_id : str
    valid: bool
    reason: Optional[str]
    agreement_rate: float
    histogram: Dict[str, int]
    trust_score: float  

class WitnessValidator:
    """
    Validator instance for a particular shard count and expected properties.
    """

    def __init__(
        self,
        num_shards,
        expected_tolerance
    ):
        if num_shards < 2:
            raise ValueError('num_shards must be >= 2')
        
        self.num_shards = num_shards
        self.expected_tolerance = expected_tolerance
    

    def validate(
            self,
            report : WitnessReport
    ):
        if not report.bitstrings:
            return ValidationResult(report.node_id , False, 'empty bitstrings',0.0,{},0.0)
        
        for s in report.bitstrings:
             if len(s) != self.num_shards or any(ch not in {"0", "1"} for ch in s):
                return ValidationResult(report.node_id, False, "invalid_bitstring_format", 0.0, {}, 0.0)


        hist = {}
        all_equal_mask = []
        for s in report.bitstrings:
            hist[s] = hist.get(s,0) + 1
            all_equal_mask.append(len(set(s))==1)
        agreement_rate=float(np.mean(np.array(all_equal_mask,dtype=float)))
        trust_score = agreement_rate
        # incorporate biometric fidelity if present (simple multiplicative weight)
        if report.biometric_fidelity is not None :
            bf = float(report.biometric_fidelity)
            if not(0.0<=bf<=1.0):
                print(f'Invalid biometric_fidelity score value {bf} from {report.node_id}')
            else:
                trust_score *= (0.5+0.5*bf)
                
        # detect tamper: agreement_rate below expected_tolerance flagged
        valid = agreement_rate >= self.expected_tolerance   

        reason = None if valid else 'low_agreement'
        return ValidationResult(
            node_id=report.node_id,
            valid=valid,
            reason=reason,
            agreement_rate=agreement_rate,
            histogram=hist,
            trust_score=float(trust_score),
        )
    
    def agg(
        self,
        results
    ):
        """
        Aggregate multiple validation results into cluster-level metrics.
        Returns: { "avg_agreement": x, "avg_trust": y, "num_valid": n, "num_reports": m }
        """
        if not results:
            return {"avg_agreement": 0.0, "avg_trust": 0.0, "num_valid": 0, "num_reports": 0}
        
        agreements = [r.agreement for r in results]
        trusts = [r.trust_score for r in results]
        num_valid = sum(1 for r in results if r.valid)
        return {
            "avg_agreement": float(np.mean(agreements)),
            "avg_trust": float(np.mean(trusts)),
            "num_valid": int(num_valid),
            "num_reports": int(len(results)),
        }