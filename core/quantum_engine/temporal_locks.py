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

