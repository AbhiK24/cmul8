"""
Chunk model for vector embeddings using pgvector
"""

from sqlalchemy import Column, String, Integer, DateTime, JSON, Text, ForeignKey, Index
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.database import Base
import uuid


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    environment_id = Column(String, ForeignKey("environments.id", ondelete="CASCADE"), nullable=False)

    # Source information
    source_id = Column(String, nullable=True)  # Dataset ID
    source_name = Column(String, nullable=True)

    # Content
    text = Column(Text, nullable=False)

    # Vector embedding (1536 dimensions for text-embedding-3-small)
    embedding = Column(Vector(1536), nullable=True)

    # Additional metadata
    chunk_metadata = Column(JSON, default=dict)

    # Chunk info
    chunk_index = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Index for vector similarity search
    __table_args__ = (
        Index(
            'ix_chunks_embedding',
            embedding,
            postgresql_using='ivfflat',
            postgresql_with={'lists': 100},
            postgresql_ops={'embedding': 'vector_cosine_ops'}
        ),
        Index('ix_chunks_environment_id', environment_id),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "environment_id": self.environment_id,
            "source_id": self.source_id,
            "source_name": self.source_name,
            "text": self.text,
            "metadata": self.chunk_metadata,
            "chunk_index": self.chunk_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
