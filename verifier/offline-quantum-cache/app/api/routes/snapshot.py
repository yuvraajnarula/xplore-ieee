from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.QuantumSnapshot, status_code=status.HTTP_201_CREATED)
def create_snapshot(snapshot_in: schemas.QuantumSnapshotCreate, db: Session = Depends(deps.get_db)):
    existing = crud.get_snapshot(db, snapshot_in.snapshot_id)
    if existing:
        raise HTTPException(status_code=400, detail="Snapshot ID already exists")
    return crud.create_snapshot(db, snapshot_in)

@router.get("/{snapshot_id}", response_model=schemas.QuantumSnapshot)
def read_snapshot(snapshot_id: str, db: Session = Depends(deps.get_db)):
    snapshot = crud.get_snapshot(db, snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return snapshot

@router.delete("/{snapshot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_snapshot(snapshot_id: str, db: Session = Depends(deps.get_db)):
    snapshot = crud.delete_snapshot(db, snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return
