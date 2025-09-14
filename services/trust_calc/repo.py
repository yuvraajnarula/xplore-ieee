from typing import Optional, List
import psycopg2
import os
from datetime import datetime

class TrustRepo:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = psycopg2.connect(db_url)
        self.conn.autocommit = True
        self._ensure_table()

    def _ensure_table(self):
        """Create the trust_audit table if it does not exist."""
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS trust_audit (
                    id SERIAL PRIMARY KEY,
                    identity_id VARCHAR(64) NOT NULL,
                    trust_score NUMERIC(10,6) NOT NULL,
                    entropy NUMERIC(10,6) NOT NULL,
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    tx_hash VARCHAR(66)
                );
            """)
        print("TrustRepo: table 'trust_audit' ensured.")

    def insert_audit(self, identity_id: str, trust_score: float, entropy: float, tx_hash: Optional[str] = None):
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO trust_audit (identity_id, trust_score, entropy, updated_at, tx_hash)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (identity_id, trust_score, entropy, datetime.utcnow(), tx_hash)
            )

    def fetch_history(self, identity_id: str) -> List[dict]:
        with self.conn.cursor() as cur:
            cur.execute(
                "SELECT trust_score, entropy, updated_at, tx_hash FROM trust_audit WHERE identity_id=%s ORDER BY updated_at DESC",
                (identity_id,)
            )
            rows = cur.fetchall()
            return [
                {"trust_score": r[0], "entropy": r[1], "updated_at": r[2], "tx_hash": r[3]}
                for r in rows
            ]
