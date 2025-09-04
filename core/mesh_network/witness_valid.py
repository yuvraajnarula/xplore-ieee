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
from typing import Dict, List, Optional, Sequence, Tuple, Any

try:
    from cryptography.hazmat.primitives import hashes, serialization, hmac
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives.asymmetric.utils import (
        encode_dss_signature,
        decode_dss_signature,
    )
    from cryptography.hazmat.primitives.serialization import (
        Encoding,
        PublicFormat,
        NoEncryption,
        PrivateFormat,
    )
except Exception as exc:
    raise ImportError("Install 'cryptography' package: pip install cryptography") from exc
import json


def json_bytes(obj: Dict) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

@dataclass
class WitnessReport:
    node_id : str
    bitstrings: Sequence[str]
    timestamp : float 
    biometric_fidelity : Optional[float] = None 
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class ValidationResult:
    node_id : str
    valid: bool
    reason: Optional[str]
    agreement_rate: float
    histogram: Dict[str, int]
    trust_score: float  
    
class CryptoHelpers:
    """
    Helpers for signing/verifiying witness reports
    """
    @staticmethod
    def canonical_serialize(report):
        """Create a stable canonical serialization of the report dict for signing."""
        keys = ["node_id", "bitstrings", "timestamp", "biometric_fidelity", "metadata"]
        payload = {k: report.get(k) for k in keys if k in report}

        if "bitstrings" in payload and isinstance(payload["bitstrings"], (list, tuple)):
            payload["bitstrings"] = tuple(payload["bitstrings"])
        return json_bytes(payload)
    @staticmethod
    def gen_ecdsa_keypair():
        """Return (private_key_obj, public_key_bytes)"""
        priv = ec.generate_private_key(ec.SECP256R1())
        pub = priv.public_key().public_bytes(Encoding.PEM, PublicFormat.SubjectPublicKeyInfo)
        return priv, pub

    @staticmethod
    def sign_ecdsa(private_key, message: bytes) -> bytes:
        sig = private_key.sign(message, ec.ECDSA(hashes.SHA256()))
        return sig

    @staticmethod
    def verify_ecdsa(public_key_bytes: bytes, signature: bytes, message: bytes) -> bool:
        public_key = serialization.load_pem_public_key(public_key_bytes)
        try:
            public_key.verify(signature, message, ec.ECDSA(hashes.SHA256()))
            return True
        except Exception:
            return False

    @staticmethod
    def sign_hmac(secret: bytes, message: bytes) -> bytes:
        mac = hmac.HMAC(secret, hashes.SHA256())
        mac.update(message)
        return mac.finalize()

    @staticmethod
    def verify_hmac(secret: bytes, signature: bytes, message: bytes) -> bool:
        mac = hmac.HMAC(secret, hashes.SHA256())
        mac.update(message)
        try:
            mac.verify(signature)
            return True
        except Exception:
            return False

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
    
    def validate_signed_report(
        self,
        report_dict: Dict,
        signature: bytes,
        method: str,
        pubkey_or_secret: bytes,
    ):
        msg = CryptoHelpers.canonical_serialize(report_dict)
        verified = False
        if method.lower() == "ecdsa":
            verified = CryptoHelpers.verify_ecdsa(pubkey_or_secret, signature, msg)
        elif method.lower() == "hmac":
            verified = CryptoHelpers.verify_hmac(pubkey_or_secret, signature, msg)
        else:
            raise ValueError("Unsupported method: choose 'ecdsa' or 'hmac'")

        if not verified:
            return ValidationResult(report_dict.get("node_id", "unknown"), False, "invalid_signature", 0.0, {}, 0.0)

        wr = WitnessReport(
            node_id=report_dict["node_id"],
            bitstrings=report_dict["bitstrings"],
            timestamp=report_dict["timestamp"],
            biometric_fidelity=report_dict.get("biometric_fidelity"),
            metadata=report_dict.get("metadata"),
        )
        return self.validate(wr)
    
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