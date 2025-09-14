import redis
from redis.exceptions import LockError
from .config import settings
from .crud import TimelockRepo
from .models import TimelockStatus
import json
import time
from datetime import timedelta
from typing import Optional
from datetime import datetime

redis_conn = redis.from_url(settings.REDIS_URL)
repo = TimelockRepo(sync_db_url=settings.DATABASE_URL)

# === Hooks: plug your blockchain and quantum modules here ===
def perform_on_chain_action(payload: dict) -> str:
    """
    Stub: implement your actual web3 transaction (sign & send).
    Return the transaction hash when successful.
    """
    # TODO: integrate web3.py or ethers-rs binding
    # Example: tx_hash = web3_send_tx(...)
    # return tx_hash
    print("perform_on_chain_action: called (stub)")
    return "0xstub-tx-hash"

def perform_off_chain_action(payload: dict) -> None:
    """
    Stub: perform off-chain release logic (webhook, notify service, etc.)
    """
    print("perform_off_chain_action: payload=%s", payload)
    from core.quantum_engine.temporal_locks import TemporalSchedulerService
    service = TemporalSchedulerService()
    result = service.release_time_lock(payload)
    return result

def execute_timelock_job(timelock_id: int):
    """
    RQ worker will call this to execute the timelock.
    This function is idempotent and uses Redis Lock to avoid double execution.
    """
    lock_key = f"timelock:exec:lock:{timelock_id}"
    lock = redis_conn.lock(lock_key, timeout=300, blocking_timeout=5)
    acquired = lock.acquire(blocking=True)
    if not acquired:
        logger.warning("Could not acquire lock for timelock %s", timelock_id)
        return

    try:
        tl = repo.get(timelock_id)
        if not tl:
            logger.error("Timelock %s not found", timelock_id)
            return

        if tl.status != TimelockStatus.PENDING:
            logger.info("Timelock %s is not pending (%s) — skipping", timelock_id, tl.status)
            return

        repo.mark_executing(timelock_id)

        payload = json.loads(tl.payload)
        now = datetime.utcnow()
        if tl.unlock_at > now:
            from .queues import schedule_execution
            schedule_execution(execute_timelock_job, timelock_id, tl.unlock_at)
            print("Timelock %s scheduled for future time %s", timelock_id, tl.unlock_at)
            return

        tx_hash = None
        try:
            if tl.on_chain:
                tx_hash = perform_on_chain_action(payload)
            else:
                perform_off_chain_action(payload)
            # mark completed
            repo.mark_completed(timelock_id, on_chain_tx=tx_hash)
            logger.info("Timelock %s executed successfully (tx=%s)", timelock_id, tx_hash)
        except Exception as e:
            print("Execution failed for timelock %s", timelock_id)
            repo.mark_failed(timelock_id, error=str(e))
            if tl.attempts < 5:
                delay_seconds = min(2 ** tl.attempts * 60, 3600)
                from rq import Queue
                from .queues import queue
                # requeue with simple delay
                queue.enqueue_in(timedelta(seconds=delay_seconds), execute_timelock_job, timelock_id)
    finally:
        try:
            lock.release()
        except LockError:
            print("Lock already released for %s", timelock_id)
