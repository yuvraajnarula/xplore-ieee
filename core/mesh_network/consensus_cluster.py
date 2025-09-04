"""
This cluster is doing the following tasks as of now:
- Coordinates rounds: request entanglement offers from the oracle, ask nodes
  to perform measurements (simulated here), collect witness reports, validate,
  and decide consensus based on aggregated metrics.

- This module intentionally simulates node measurements locally. In a deployed
  system nodes would be remote processes that actually operate on qubits and sign reports.
"""


from __future__ import annotations
import json 
import time 
from dataclasses import dataclass , asdict
from typing import Dict, Iterable, List, Optional, Tuple
from .quantum_oracle import QuantumOracle
from .witness_valid import WitnessReport, WitnessValidator , CryptoHelpers
from ..quantum_engine import EntangledShardsSystem, TemporalLockManager,BiometricEncoder, fidelity
import secrets 

@dataclass 
class ClusterDecision:
    achieved: bool
    metrics: Dict
    raw_reports: List[Dict]

class ConsensusCluster:
    """
    Orchestrates consensus rounds among shard nodes. Uses QuantumOracle for offers
    and WitnessValidator for validating returned reports.
    """
    def __init__(
      self,
      n_shards : int,
      signing_method : str = 'ecdsa',
      expected_tolerance:Optional[float]=0.9   
    ):
      self.n_shards = n_shards 
      self.oracle = QuantumOracle()
      self.validator = WitnessValidator(
         num_shards=n_shards,
         expected_tolerance=expected_tolerance
      )
      self.signing_method = signing_method.lower()
      self.node_keys = {}
      self.init_node_keys()
      self.lock_mgr: Optional[TemporalLockManager] = None
      self.encoder: Optional[BiometricEncoder] = None
      self.validator = WitnessValidator(num_shards=n_shards, expected_tolerance=expected_tolerance)
    
    def init_node_keys(
      self
    ):
      for i in range(self.n_shards):
        node_id = f'node-{i}'
        if self.signing_method == 'ecdsa' :
          priv, pub = CryptoHelpers.gen_ecdsa_keypair()
          self.node_keys[node_id] = {"priv": priv, "pub": pub}

        elif self.signing_method == "hmac":
          secret = secrets.token_bytes(32)
          self.node_keys[node_id] = {"secret": secret}
        else:
          raise ValueError("Unsupported signing method: ecdsa or hmac")

    def attatch_lock_manager(
      self,
      lock_mgr : TemporalLockManager,
    ):
      self.lock_mgr = lock_mgr
    
    def attach_biometric_encoder(
      self,
      encoder : BiometricEncoder
    ):
      self.encoder = encoder 
    
    def node_sign(
      self,
      node_id,
      report_dict
    ):
      msg = CryptoHelpers.canonical_serialize(report_dict)
      key_info = self.node_keys[node_id]
      if self.signing_method == 'ecdsa':
        priv = key_info["priv"]
        sig = CryptoHelpers.sign_ecdsa(priv, msg)  
        pub = key_info["pub"]
        return sig, pub
      else:
        secret = key_info["secret"]
        sig = CryptoHelpers.sign_hmac(secret, msg)
        return sig, secret
        
    def start_round(
        self,
        shard_indxs: Iterable[int],
        kind: str = "ghz",
        ttl_seconds: int = 30,
        run_quick_verify: bool = False,
        simulate_nodes: bool = True,
        repetitions: int = 1024,
    ):
        shard_indxs = tuple(int(i) for i in shard_indxs)
        offer = self.oracle.create_offer(shard_indxs, kind=kind, ttl_seconds=ttl_seconds, run_quick_verify=run_quick_verify, persist=True)

        # determine which nodes are locked at time of measurement
        now = time.time()
        locked_nodes = set()
        if self.lock_mgr is not None:
            for i in shard_indxs:
                if self.lock_mgr.is_locked(i, now):
                    locked_nodes.add(i)

        # Optionally use entanglement engine to obtain sample histogram
        reports: List[Dict] = []
        sample_list: List[str] = []
        if simulate_nodes and EntangledShardsSystem is not None:
            engine = EntangledShardsSystem(
                num_shards=len(shard_indxs),
                basis="Z",
                repetitions=repetitions,
                tamper=(),
                depolarizing_prob=0.0,
            )
            result = engine.run()
            hist = result.get("bitstring_histogram", {})
            for bitstr, count in hist.items():
                sample_list.extend([bitstr] * min(count, 500))
            if not sample_list:
                sample_list = ["0" * len(shard_indxs)] * 128

        # create a report per node
        for i_idx, shard in enumerate(shard_indxs):
            node_id = f"node-{shard}"
            # select shots for this node
            bitstrings = sample_list[:256] if sample_list else ["0" * len(shard_indxs)] * 128

            # compute biometric fidelity if encoder available (simulate biometrics if absent)
            biometric_fidelity = None
            if self.encoder is not None:
                # simple: encode two nearby vectors and compute fidelity
                # in real system you'd pass actual embeddings
                live = [0.2 + 0.001 * shard] * min(2 ** self.encoder.num_qubits, 4)
                ref = [0.2] * min(2 ** self.encoder.num_qubits, 4)
                try:
                    s_live, _ = self.encoder.encode(live)
                    s_ref, _ = self.encoder.encode(ref)
                    biometric_fidelity = fidelity(s_live, s_ref)
                except Exception as exc:
                    print("Biometric encode failed for %s: %s", node_id, exc)
                    biometric_fidelity = None

            # lock-awareness: if node is locked, we simulate it not participating (no tamper)
            metadata = {"locked": (shard in locked_nodes)}

            report_dict = {
                "node_id": node_id,
                "bitstrings": bitstrings,
                "timestamp": time.time(),
                "biometric_fidelity": biometric_fidelity,
                "metadata": metadata,
            }

            sig, pub_or_secret = self._node_sign(node_id, report_dict)
            reports.append({"report": report_dict, "signature": sig, "signer_pub": pub_or_secret})

        # Validate all reports (verify signature first)
        validation_results = []
        raw_reports = []
        for r in reports:
            report_dict = r["report"]
            sig = r["signature"]
            pub_or_secret = r["signer_pub"]
            method = self.signing_method
            vr = self.validator.validate_signed_report(report_dict, sig, method, pub_or_secret)
            validation_results.append(vr)
            raw_reports.append(asdict(vr))

        agg = self.validator.aggregate(validation_results)
        achieved = agg["avg_agreement"] >= self.validator.expected_tolerance and agg["num_valid"] >= (len(validation_results) / 2.0)

        metrics = {"offer_id": offer.offer_id, "offer_meta": asdict(offer), "aggregate": agg}
        return ClusterDecision(achieved=bool(achieved), metrics=metrics, raw_reports=raw_reports)
