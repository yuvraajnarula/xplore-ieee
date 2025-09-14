"""
This module implements time-based access control over quantum shards (qubits)
in your entangled_shards system. It simulates temporal locks that:
    Allow or block early measurement (tampering) of specific shards.
    Unlock shards only after a certain timestamp or time duration.
    Enforce time-sensitive coordination in a quantum identity network.
"""

from datetime import datetime,timedelta
class TemporalLockManager:
    """
    Register temporal locks on shards.

    Check if a shard is currently locked or unlocked.

    Support both absolute time and relative time (like "lock for 5 seconds").
    """
    def __init__(self):
        self.locks = dict()
    
    def add_abs_lock(self,shard_idx,unlock_time):
        """
        Add a lock using an absolute UTC time string.
        Format: "YYYY-MM-DDTHH:MM:SS" (ISO 8601 format).
        """
        try:
            unlock_time = datetime.fromisoformat(unlock_time)
            self.locks[shard_idx] = unlock_time
        except ValueError:
            raise ValueError(f"Invalid ISO datetime: {unlock_time}")

    def add_rltv_lock(self,shard_idx,duration):
        now = datetime.now()
        unlock_time = now + timedelta(seconds=duration)
        self.locks[shard_idx] = unlock_time
    
    def is_locked(self,shard_idx,curr):
        curr = curr or datetime.now()
        unlock = self.locks.get(shard_idx)
        if unlock is None : 
            return False 

        return curr < unlock 
    
    def unlocked_shards(self,total,curr):
        return [
            i for i in range(total)
            if not self.is_locked(i, curr)
        ]


from datetime import datetime
from typing import Dict, Any, Optional
class TemporalSchedulerService:
    """
    Service layer for managing temporal locks over shards.
    Provides an API to release/add locks based on incoming payloads.
    """

    def __init__(self):
        self.lock_manager = TemporalLockManager()

    def release_time_lock(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a temporal lock based on payload.

        Expected payload:
        {
            "shard_idx": int,
            "mode": "abs" | "rltv",
            "unlock_time": "YYYY-MM-DDTHH:MM:SS"  # required if abs
            "duration": int  # required if rltv, seconds
        }
        """
        shard_idx: Optional[int] = payload.get("shard_idx")
        mode: Optional[str] = payload.get("mode")

        if shard_idx is None or mode not in {"abs", "rltv"}:
            print("Invalid payload: %s", payload)
            return {
                "success": False,
                "message": "Invalid payload: shard_idx and mode are required",
            }

        try:
            if mode == "abs":
                unlock_time = payload.get("unlock_time")
                if not unlock_time:
                    raise ValueError("unlock_time required for abs mode")
                self.lock_manager.add_abs_lock(shard_idx, unlock_time)
                print("Absolute lock added for shard %s until %s", shard_idx, unlock_time)

            elif mode == "rltv":
                duration = payload.get("duration")
                if duration is None:
                    raise ValueError("duration required for rltv mode")
                self.lock_manager.add_rltv_lock(shard_idx, duration)
                print("Relative lock added for shard %s for %s seconds", shard_idx, duration)

            return {
                "success": True,
                "message": f"Lock registered for shard {shard_idx} in {mode} mode",
                "data": {
                    "shard_idx": shard_idx,
                    "mode": mode,
                    "unlock_at": str(self.lock_manager.locks.get(shard_idx))
                },
            }

        except Exception as e:
            print("Failed to add lock for shard %s", shard_idx)
            return {
                "success": False,
                "message": str(e),
            }