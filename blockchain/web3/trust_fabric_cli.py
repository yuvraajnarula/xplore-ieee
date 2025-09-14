import json, os
from web3 import Web3
from eth_account import Account
from typing import Optional

class TrustFabricClient:
    def __init__(self, rpc_url: str, private_key: str, contract_addr: str, abi_path: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.oracle = Account.from_key(private_key)
        with open(abi_path) as f:
            abi = json.load(f)
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_addr),
            abi=abi
        )

    def update_trust(self, identity_id: str, score: float, entropy: float) -> Optional[str]:
        """Push trust score to chain. Returns tx hash (hex)."""
        try:
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
        return self.contract.functions.getTrust(identity_id).call()

    def get_all_identities(self):
        return self.contract.functions.getAllIdentities().call()

    def rank_identities(self):
        ids, scores = self.contract.functions.rankIdentities().call()
        return list(zip(ids, scores))
