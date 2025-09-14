import redis
from rq import Queue
from rq_scheduler import Scheduler
from .config import settings
from datetime import datetime, timezone

redis_conn = redis.from_url(settings.REDIS_URL)
queue = Queue("timelocks", connection=redis_conn, default_timeout=3600)
scheduler = Scheduler(queue=queue, connection=redis_conn)

def schedule_execution(task_func, timelock_id: int, run_at: datetime):
    """
    Schedule the worker job to run at run_at (UTC). We schedule an RQ job.
    """
    # Ensure run_at is aware UTC
    if run_at.tzinfo is None:
        run_at = run_at.replace(tzinfo=timezone.utc)
    return scheduler.enqueue_at(run_at, task_func, timelock_id)
