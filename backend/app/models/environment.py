"""
Environment model for indexed datasets
"""

from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.db.database import Base
import uuid


class Environment(Base):
    __tablename__ = "environments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, default="default")
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Source datasets
    dataset_ids = Column(JSON, default=list)  # List of dataset IDs

    # Vector store
    chunk_count = Column(Integer, default=0)

    # RAG config
    rag_config = Column(JSON, default=dict)

    # Status
    status = Column(String, default="building")  # building, ready, failed
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "name": self.name,
            "description": self.description,
            "dataset_ids": self.dataset_ids,
            "chunk_count": self.chunk_count,
            "rag_config": self.rag_config,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
