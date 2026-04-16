"""
Dataset API endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.db.database import get_db
from app.models.dataset import Dataset
from app.services.storage import upload_file
from app.services.file_parser import parse_file

router = APIRouter()


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(None),
    description: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a new dataset file (CSV, PDF, JSON, XLSX).
    """
    # Read file content
    content = await file.read()
    filename = file.filename or "unknown"
    ext = filename.lower().split(".")[-1]

    if ext not in ["csv", "json", "pdf", "xlsx", "xls"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    # Generate ID and storage key
    dataset_id = str(uuid.uuid4())
    storage_key = f"datasets/{dataset_id}/{filename}"

    # Upload to storage
    file_path = upload_file(content, storage_key, file.content_type or "application/octet-stream")

    # Create dataset record
    dataset = Dataset(
        id=dataset_id,
        name=name or filename,
        description=description,
        type=ext,
        file_path=file_path,
        original_filename=filename,
        size_bytes=len(content),
        status="processing"
    )
    db.add(dataset)
    db.commit()

    # Parse file
    try:
        parsed = parse_file(content, filename)

        dataset.row_count = parsed.get("row_count") or parsed.get("page_count")
        dataset.columns = parsed.get("columns")
        dataset.status = "ready"

        db.commit()

    except Exception as e:
        dataset.status = "failed"
        dataset.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

    return dataset.to_dict()


@router.get("")
def list_datasets(
    project_id: str = "default",
    db: Session = Depends(get_db)
):
    """List all datasets for a project."""
    datasets = db.query(Dataset).filter(Dataset.project_id == project_id).all()
    return [d.to_dict() for d in datasets]


@router.get("/{dataset_id}")
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Get a dataset by ID."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset.to_dict()


@router.get("/{dataset_id}/preview")
def preview_dataset(
    dataset_id: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Preview first N rows of a dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if dataset.type not in ["csv", "json", "xlsx"]:
        raise HTTPException(status_code=400, detail="Preview not available for this file type")

    # Re-parse to get data (in production, you'd cache this)
    from app.services.storage import download_file

    content = download_file(dataset.file_path)
    if not content:
        raise HTTPException(status_code=500, detail="Could not read file")

    parsed = parse_file(content, dataset.original_filename or f"file.{dataset.type}")

    data = parsed.get("data", [])
    if isinstance(data, list):
        data = data[:limit]

    return {
        "dataset": dataset.to_dict(),
        "preview": data
    }


@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Delete a dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    db.delete(dataset)
    db.commit()

    return {"status": "deleted", "id": dataset_id}
