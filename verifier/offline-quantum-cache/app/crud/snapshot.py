from sqlalchemy.orm import Session 
from app.db import model
from app import schemas

def get_snapshot(db: Session, snapshot_id: str):
    return db.query(model.QuantumSnapshotModel).filter(model.QuantumSnapshotModel.snapshot_id==snapshot_id).first()

def create_snapshot(db: Session, snapshot : schemas.QuantumSnapshotCreate):
    db_snapshot = model.QuantumSnapshotModel(snapshot_id = snapshot.snapshot_id, data = snapshot.data)
    db.add(db_snapshot)
    db.commit()
    db.refresh(db_snapshot)
    return db_snapshot

def delete_snapshot(db: Session, snapshot_id: str):
    snapshot = get_snapshot(snapshot_id=snapshot_id)
    if snapshot:
        db.delete(snapshot)
        db.commit()
    
    return snapshot