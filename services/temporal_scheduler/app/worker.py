import redis
from redis.exceptions import LockError
from .config import settings
from .crud import TimelockRepo
from .models import TimelockStatus
import json
import time
from datetime import timedelta, datetime
from typing import Optional

from web3 import Web3
from eth_account import Account

redis_conn = redis.from_url(settings.REDIS_URL)
repo = TimelockRepo(sync_db_url=settings.DATABASE_URL)

# Web3 connection (Infura, Alchemy, or your RPC)
w3 = Web3(Web3.HTTPProvider(settings.ETH_RPC_URL))

# Load contract ABI + address for TemporalCredentials
with open("blockchain/contracts/abis/TemporalCredentials.json") as f:
    TEMPORAL_ABI = json.load(f)

TEMPORAL_ADDR = Web3.to_checksum_address(settings.TEMPORAL_CONTRACT)
temporal_contract = w3.eth.contract(address=TEMPORAL_ADDR, abi=TEMPORAL_ABI)

# Wallet
issuer = Account.from_key(settings.ETH_PRIVATE_KEY)

def perform_on_chain_action(payload: dict) -> str:
    """
    Send tx to TemporalCredentials contract.
    Example: claim a credential after unlock time.
    """
    try:
        cred_id = int(payload["credential_id"])
        nonce = w3.eth.get_transaction_count(issuer.address)

        tx = temporal_contract.functions.claimCredential(cred_id).build_transaction({
            "from": issuer.address,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": w3.to_wei("5", "gwei"),
        })

        signed = issuer.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        print("Sent claimCredential(%s) tx=%s", cred_id, tx_hash.hex())
        return tx_hash.hex()

    except Exception as e:
        print("perform_on_chain_action failed: %s", e)
        raise


def perform_off_chain_action(payload: dict) -> None:
    """
    Off-chain release: use temporal scheduler service.
    """
    from core.quantum_engine.temporal_locks import TemporalSchedulerService
    service = TemporalSchedulerService()
    return service.release_time_lock(payload)


def execute_timelock_job(timelock_id: int):
    """
    Worker entrypoint: executes timelock with Redis lock to avoid races.
    """
    lock_key = f"timelock:exec:lock:{timelock_id}"
    lock = redis_conn.lock(lock_key, timeout=300, blocking_timeout=5)

    if not lock.acquire(blocking=True):
        print("Could not acquire lock for timelock %s", timelock_id)
        return

    try:
        tl = repo.get(timelock_id)
        if not tl:
            print("Timelock %s not found", timelock_id)
            return

        if tl.status != TimelockStatus.PENDING:
            print("Timelock %s already %s — skipping", timelock_id, tl.status)
            return

        repo.mark_executing(timelock_id)

        payload = json.loads(tl.payload)
        now = datetime.utcnow()
        if tl.unlock_at > now:
            # Not yet unlocked → reschedule
            from .queues import schedule_execution
            schedule_execution(execute_timelock_job, timelock_id, tl.unlock_at)
            print("Rescheduled timelock %s for %s", timelock_id, tl.unlock_at)
            return

        tx_hash = None
        try:
            if tl.on_chain:
                tx_hash = perform_on_chain_action(payload)
            else:
                perform_off_chain_action(payload)

            repo.mark_completed(timelock_id, on_chain_tx=tx_hash)
            print("Timelock %s executed successfully (tx=%s)", timelock_id, tx_hash)
        except Exception as e:
            print("Execution failed for timelock %s: %s", timelock_id, e)
            repo.mark_failed(timelock_id, error=str(e))

            # Retry with backoff
            if tl.attempts < 5:
                delay_seconds = min(2 ** tl.attempts * 60, 3600)
                from .queues import queue
                queue.enqueue_in(
                    timedelta(seconds=delay_seconds),
                    execute_timelock_job,
                    timelock_id
                )
    finally:
        try:
            lock.release()
        except LockError:
            print("Lock already released for %s", timelock_id)
