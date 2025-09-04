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
from .witness_valid import WitnessReport, WitnessValidator
from ..quantum_engine import EntangledShardsSystem

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
      expected_tolerance:Optional[float]=0.9   
    ):
      self.n_shards = n_shards 
      self.oracle = QuantumOracle()
      self.validator = WitnessValidator(
         num_shards=n_shards,
         expected_tolerance=expected_tolerance
      )
    
    def start_round(
        self,
        shard_indxs : Iterable[int],
        kind: str = 'ghz',
        ttl_secs:int=30,
        run_quick_verify : bool = False,
        sim_nodes : bool = True,
        reptitions: int =1024
    ):
      shard_indxs = tuple(int(i) for i in shard_indxs)
      offer = self.oracle.create_offer(
         shard_indxs=shard_indxs,
         kind=kind,
         ttl_sec=ttl_secs,
         run_quick_verify=run_quick_verify
      )
      rep = []

      if sim_nodes:
        if EntangledShardsSystem is None:
          print('EntangledShardsSystem not available')
          print('using synthetic ideal reports')
          for i in shard_indxs:
            rep.append({
                'node_id': f'node-{i}',
                'bitstrings': ['0'*len(shard_indxs)]*64,
                'timestamp' : time.time(),
                'biometric_fidelity' : 0.0
            })    
        else:
          engine = EntangledShardsSystem(
              num_shards=len(shard_indxs),
              basis='Z',
              repetitions=reptitions,
              tamper=(),
              depolarizing_prob=0.0,
           )
          res = engine.run()
          hist = res.get('bitstring_histogram',{})
          sample_list = []
          for bitstr,count in hist.items():
            sample_list.extend([bitstr]*min(count,500))
          
          if not sample_list:
            sample_list = ["0" * len(shard_indxs)] * 128
          
          for i in shard_indxs:
            rep.append({
               "node_id": f"node-{i}",
                "bitstrings": sample_list[:256],  # each node provides up to 256 shots
                "timestamp": time.time(),
                "biometric_fidelity": None,
            })
      validation_res = []
      raw_rep = []
      for r in rep:
        wr = WitnessReport(
          node_id=r['node-id'],
          bitstrings=r['bitstrings'],
          timestamp=r['timestamp'],
          biometric_fidelity=r.get('biometric_fidelity')
        )
        vr = self.validator.validate(wr)
        validation_res.append(vr)
        raw_rep.append(asdict(vr))
      
      agg = self.validator.agg(validation_res)
      achieved = agg['avg_agreement'] >= self.validator.expected_tolerance and agg['num_valid'] >= (len(validation_res)/2.0)
      
      metrics = {
        'offer_id' : offer.offer_id,
        'offer_meta' : asdict(offer),
        'aggregate' : agg
      }
            
      return ClusterDecision(achieved=bool(achieved),metrics=metrics,raw_reports=raw_rep)