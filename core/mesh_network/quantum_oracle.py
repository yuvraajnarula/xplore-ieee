"""
A quantum oracle is a conceptual `black box` in quantum computing that represents a function,
typically unitary and reversible, which a quantum algorithm can query to obtain information without
needing to know the function's internal details

We'll be building a simple oracle system  for allocating entangled resources (Bell/GHZ), issuing challenge
nonces, and returning metadata about entanglement offers

nonces - > A nonce is a random or pseudo-random, "number used once" in a cryptographic context to ensure that each
communication or operation is unique and prevent replay attacks. 
"""
from dataclasses import dataclass, asdict
from typing import Dict, Iterable, List, Optional, Tuple
import secrets
import time
from ..quantum_engine.quantum_consensus import EntangledShardsSystem  
@dataclass
class EntanglementOffer : 
    """
    Metadata describing a proposed entanglement resource.
    """
    offer_id: str
    created_at: float
    shard_indxs: Tuple[int, ...]
    kind: str  # "bell" or "ghz"
    expected_qubits: int
    ttl_sec: int = 30  # how long the offer is valid (advisory)
    verification_hint: Optional[Dict] = None  # optional small verification result


class QuantumOracle:
    """
    Stores and issues entanglement offers and challenge nonces.
    """

    def __init__(
            self
    ):
        self.offers = dict()
        self.nonces = dict()
        self.ledger: List[EntanglementOffer] = []  
    
    def create_offer(
            self,
            shard_indxs,
            kind : str = 'ghz',
            ttl_sec : int = 30,
            run_quick_verify : bool = False,
            persist: bool = True,
    ):
        if len(shard_indxs) < 2:
            raise ValueError("At least 2 shard indices are required for entanglement.")

        kind= kind.lower()
        if kind not in ['ghz','bell']:
            raise ValueError(f'kind should be ghz or bell')
    
        offer_id = secrets.token_hex(16)
        offer  = EntanglementOffer(
            offer_id=offer_id,
            created_at=time.time(),
            shard_indxs=shard_indxs,
            kind=kind,
            expected_qubits=len(shard_indxs),
            ttl_sec=ttl_sec,
            verification_hint=int(ttl_sec)
        )

        if run_quick_verify:

            if EntangledShardsSystem is not None:
                try:
                    engine = EntangledShardsSystem(
                        num_shards=len(shard_indxs),
                        basis="Z",
                        repetitions=128,
                        tamper=(),
                        depolarizing_prob=0.0,
                    )
                    rep = engine.run()
                    offer.verification_hint = {
                        "agreement_rate": rep.get("agreement_rate"),
                        "sample_histogram": dict(list(rep.get("bitstring_histogram", {}).items())[:3]),
                    }
                except Exception as exc:
                    print("Quick verify failed: %s", exc)
                    offer.verification_hint = {"error": str(exc)}
        # register in live offers
        self._offers[offer_id] = offer

        # persist to ledger if requested
        if persist:
            self.ledger.append(offer)
            print("Offer persisted to ledger: %s", offer_id)

        print("Created entanglement offer %s for shards %s", offer_id, shard_indxs)
        return offer

    def get_offer(
            self,
            offer_id
    ):
        offer = self.offers.get(offer_id)
        if offer is None:
            return None 

        if time.time() - offer.created_at > offer.ttl_secs :
            print(f'{offer_id} is expired, removing')
            self.offers.pop(offer_id,None)
            return None 

        return offer 

    def ls_offers(
            self,
            page : int =1,
            page_size : int = 10
    ):
        total = len(self.ledger)
        if total == 0:
            return {"page": page, "page_size": page_size, "total": 0, "offers": []}
        # clamp page
        page = max(1, int(page))
        start = (page - 1) * page_size
        end = start + page_size
        slice_offers = self.ledger[start:end]
        serialized = [asdict(o) for o in slice_offers]
        return {"page": page, "page_size": page_size, "total": total, "offers": serialized}


    
    def issue_nonce(
            self,
            ttl_secs
    ):
        n= secrets.token_hex(16)
        self.nonces[n]= time.time() + ttl_secs
        print(f'Issued Nonce {n} valid for {ttl_secs}')
        return n 

    def verify_nonce(
            self,
            nonce
    ):
        exp = self.nonces.get(nonce)
        if exp is None:
            return False 
        
        if time.time() >exp:
            self.nonces.pop(nonce, None)
            return False 
        self.nonces.pop(nonce, None)
        return True 
