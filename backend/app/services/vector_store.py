"""
Vector store service using pgvector
"""

from typing import List, Dict, Any
import openai
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from app.config import get_settings
from app.db.database import SessionLocal
from app.models.chunk import Chunk

settings = get_settings()

# OpenAI client for embeddings
openai_client = None
if settings.openai_api_key:
    openai_client = openai.OpenAI(api_key=settings.openai_api_key)


def get_embedding(text: str) -> List[float]:
    """Get embedding for a single text."""
    if not openai_client:
        raise ValueError("OpenAI API key not configured")

    response = openai_client.embeddings.create(
        model=settings.embedding_model,
        input=text
    )
    return response.data[0].embedding


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings for multiple texts in batches."""
    if not openai_client:
        raise ValueError("OpenAI API key not configured")

    # OpenAI can handle up to 2048 inputs at once, but batch for safety
    batch_size = 100
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = openai_client.embeddings.create(
            model=settings.embedding_model,
            input=batch
        )
        all_embeddings.extend([d.embedding for d in response.data])

    return all_embeddings


def add_chunks(
    environment_id: str,
    chunks: List[Dict[str, Any]],
    db: Session = None
) -> int:
    """
    Add chunks to an environment.
    Returns number of chunks added.
    """
    if not chunks:
        return 0

    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Get embeddings for all texts
        texts = [c["text"] for c in chunks]
        embeddings = get_embeddings(texts)

        # Create chunk records
        chunk_records = []
        for i, chunk_data in enumerate(chunks):
            chunk = Chunk(
                id=chunk_data.get("id", None),
                environment_id=environment_id,
                source_id=chunk_data.get("metadata", {}).get("source_id"),
                source_name=chunk_data.get("metadata", {}).get("source_name"),
                text=chunk_data["text"],
                embedding=embeddings[i],
                chunk_metadata=chunk_data.get("metadata", {}),
                chunk_index=chunk_data.get("metadata", {}).get("index", i)
            )
            chunk_records.append(chunk)

        db.add_all(chunk_records)
        db.commit()

        return len(chunk_records)

    finally:
        if close_db:
            db.close()


def search(
    environment_id: str,
    query: str,
    k: int = None,
    db: Session = None
) -> List[Dict[str, Any]]:
    """
    Search for similar chunks in an environment using cosine similarity.
    """
    if k is None:
        k = settings.retrieval_k

    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Get query embedding
        query_embedding = get_embedding(query)

        # Query using pgvector cosine distance
        # Lower distance = more similar, so we order ascending
        results = db.execute(
            select(
                Chunk.id,
                Chunk.text,
                Chunk.source_id,
                Chunk.source_name,
                Chunk.chunk_metadata,
                Chunk.embedding.cosine_distance(query_embedding).label("distance")
            )
            .where(Chunk.environment_id == environment_id)
            .order_by("distance")
            .limit(k)
        ).fetchall()

        # Format results
        formatted = []
        for row in results:
            formatted.append({
                "id": row.id,
                "text": row.text,
                "source_id": row.source_id,
                "source_name": row.source_name,
                "metadata": row.chunk_metadata or {},
                "score": 1 - row.distance  # Convert distance to similarity
            })

        return formatted

    finally:
        if close_db:
            db.close()


def delete_environment_chunks(environment_id: str, db: Session = None) -> int:
    """Delete all chunks for an environment."""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        result = db.execute(
            delete(Chunk).where(Chunk.environment_id == environment_id)
        )
        db.commit()
        return result.rowcount

    finally:
        if close_db:
            db.close()


def get_chunk_count(environment_id: str, db: Session = None) -> int:
    """Get the number of chunks for an environment."""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        count = db.query(Chunk).filter(
            Chunk.environment_id == environment_id
        ).count()
        return count

    finally:
        if close_db:
            db.close()
