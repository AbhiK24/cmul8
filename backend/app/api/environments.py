"""
Environment API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from app.db.database import get_db
from app.models.dataset import Dataset
from app.models.environment import Environment
from app.services.storage import download_file
from app.services.file_parser import parse_file
from app.services.chunker import chunk_text, chunk_structured_data, chunk_pdf_pages
from app.services.vector_store import add_chunks, delete_environment_chunks, get_chunk_count
from app.services.rag import query_environment
from app.services.data_analyst import analyze_environment

router = APIRouter()


class CreateEnvironmentRequest(BaseModel):
    name: str
    description: Optional[str] = None
    dataset_ids: List[str]


class QueryRequest(BaseModel):
    question: str
    k: Optional[int] = 5
    mode: Optional[str] = "analyze"  # "analyze" (multi-step agent) or "simple" (basic RAG)


@router.post("")
def create_environment(
    request: CreateEnvironmentRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new environment from datasets.
    This indexes the datasets for RAG queries.
    """
    # Validate datasets exist
    datasets = db.query(Dataset).filter(Dataset.id.in_(request.dataset_ids)).all()
    if len(datasets) != len(request.dataset_ids):
        raise HTTPException(status_code=400, detail="One or more datasets not found")

    # Create environment record
    env_id = str(uuid.uuid4())

    environment = Environment(
        id=env_id,
        name=request.name,
        description=request.description,
        dataset_ids=request.dataset_ids,
        status="building"
    )
    db.add(environment)
    db.commit()

    # Process each dataset and add to vector store
    total_chunks = 0

    try:
        for dataset in datasets:
            # Download file content
            content = download_file(dataset.file_path)
            if not content:
                # Try reading from local path directly
                try:
                    with open(dataset.file_path, "rb") as f:
                        content = f.read()
                except:
                    continue

            # Parse file
            parsed = parse_file(content, dataset.original_filename or f"file.{dataset.type}")

            # Create chunks based on file type
            metadata = {
                "source_id": dataset.id,
                "source_name": dataset.name,
                "source_type": dataset.type
            }

            if dataset.type in ["csv", "json", "xlsx"]:
                chunks = chunk_structured_data(
                    parsed.get("data", []),
                    parsed.get("columns", []),
                    metadata
                )
            elif dataset.type == "pdf":
                chunks = chunk_pdf_pages(parsed.get("pages", []), metadata)
            else:
                # Generic text chunking
                chunks = chunk_text(parsed.get("full_text", ""), metadata)

            # Add to vector store
            added = add_chunks(env_id, chunks, db)
            total_chunks += added

        environment.chunk_count = total_chunks
        environment.status = "ready"
        db.commit()

    except Exception as e:
        environment.status = "failed"
        environment.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to build environment: {str(e)}")

    return environment.to_dict()


@router.get("")
def list_environments(
    project_id: str = "default",
    db: Session = Depends(get_db)
):
    """List all environments for a project."""
    environments = db.query(Environment).filter(Environment.project_id == project_id).all()
    return [e.to_dict() for e in environments]


@router.get("/{env_id}")
def get_environment(env_id: str, db: Session = Depends(get_db)):
    """Get an environment by ID."""
    environment = db.query(Environment).filter(Environment.id == env_id).first()
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")

    # Get chunk count
    result = environment.to_dict()
    result["vector_store_count"] = get_chunk_count(environment.id, db)

    return result


@router.post("/{env_id}/query")
def query_env(
    env_id: str,
    request: QueryRequest,
    db: Session = Depends(get_db)
):
    """
    Query an environment using the data analyst agent.

    Modes:
    - "analyze": Multi-step agent (plan → inspect → code → execute → validate → report)
    - "simple": Basic RAG retrieval + single LLM call
    """
    environment = db.query(Environment).filter(Environment.id == env_id).first()
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")

    if environment.status != "ready":
        raise HTTPException(status_code=400, detail=f"Environment is not ready (status: {environment.status})")

    try:
        if request.mode == "simple":
            # Basic RAG query
            result = query_environment(
                environment.id,
                request.question,
                k=request.k
            )
        else:
            # Full data analyst agent pipeline
            result = analyze_environment(
                environment.id,
                request.question
            )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@router.post("/{env_id}/reindex")
def reindex_environment(env_id: str, db: Session = Depends(get_db)):
    """Re-index an environment with updated chunking."""
    environment = db.query(Environment).filter(Environment.id == env_id).first()
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")

    # Delete existing chunks
    delete_environment_chunks(environment.id, db)

    environment.status = "building"
    db.commit()

    # Re-process each dataset
    datasets = db.query(Dataset).filter(Dataset.id.in_(environment.dataset_ids)).all()
    total_chunks = 0

    try:
        for dataset in datasets:
            content = download_file(dataset.file_path)
            if not content:
                try:
                    with open(dataset.file_path, "rb") as f:
                        content = f.read()
                except:
                    continue

            parsed = parse_file(content, dataset.original_filename or f"file.{dataset.type}")

            metadata = {
                "source_id": dataset.id,
                "source_name": dataset.name,
                "source_type": dataset.type
            }

            if dataset.type in ["csv", "json", "xlsx"]:
                chunks = chunk_structured_data(
                    parsed.get("data", []),
                    parsed.get("columns", []),
                    metadata
                )
            elif dataset.type == "pdf":
                chunks = chunk_pdf_pages(parsed.get("pages", []), metadata)
            else:
                chunks = chunk_text(parsed.get("full_text", ""), metadata)

            added = add_chunks(env_id, chunks, db)
            total_chunks += added

        environment.chunk_count = total_chunks
        environment.status = "ready"
        db.commit()

    except Exception as e:
        environment.status = "failed"
        environment.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to reindex: {str(e)}")

    return {"status": "reindexed", "chunk_count": total_chunks}


@router.delete("/{env_id}")
def delete_environment(env_id: str, db: Session = Depends(get_db)):
    """Delete an environment and its vector store."""
    environment = db.query(Environment).filter(Environment.id == env_id).first()
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")

    # Delete vector store chunks
    delete_environment_chunks(environment.id, db)

    # Delete record
    db.delete(environment)
    db.commit()

    return {"status": "deleted", "id": env_id}
