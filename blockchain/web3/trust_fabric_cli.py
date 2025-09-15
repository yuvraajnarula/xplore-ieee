import json, os
from web3 import Web3
from eth_account import Account
from typing import Optional

class TrustFabricClient:
    def __init__(self, rpc_url: str, private_key: Optional[str], contract_addr: Optional[str], abi_path: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.oracle = None
        self.contract = None
        if private_key and private_key.strip() and contract_addr and contract_addr.strip():
            try:
                # Normalize 0x prefix
                key = private_key.strip()
                if not key.startswith("0x") and len(key) == 64:
                    key = "0x" + key
                self.oracle = Account.from_key(key)
                with open(abi_path) as f:
                    abi = json.load(f)
                addr = Web3.to_checksum_address(contract_addr)
                self.contract = self.w3.eth.contract(address=addr, abi=abi)
            except Exception as e:
                print(f"[TrustFabricClient] Disabled blockchain client due to config error: {e}")
                self.oracle = None
                self.contract = None

    def update_trust(self, identity_id: str, score: float, entropy: float) -> Optional[str]:
        """Push trust score to chain. Returns tx hash (hex)."""
        try:
            if not self.oracle or not self.contract:
                # Blockchain not configured; act as no-op
                return None
            nonce = self.w3.eth.get_transaction_count(self.oracle.address)
            tx = self.contract.functions.updateTrust(
                identity_id,
                int(score * 1e6),
                int(entropy * 1e6)
            ).build_transaction({
                "from": self.oracle.address,
                "nonce": nonce,
                "gas": 200_000,
                "gasPrice": self.w3.to_wei("5", "gwei"),
            })
            signed = self.oracle.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed.rawTransaction)
            return tx_hash.hex()
        except Exception as e:
            print(f"[TrustFabricClient] Error: {e}")
            return None

    def get_trust(self, identity_id: str):
        if not self.contract:
            return None
        return self.contract.functions.getTrust(identity_id).call()

    def get_all_identities(self):
        if not self.contract:
            return []
        return self.contract.functions.getAllIdentities().call()

    def rank_identities(self):
        if not self.contract:
            return []
        ids, scores = self.contract.functions.rankIdentities().call()
        return list(zip(ids, scores))
