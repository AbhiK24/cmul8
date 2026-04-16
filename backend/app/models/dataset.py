"""
Dataset model for uploaded files
"""

from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.db.database import Base
import uuid


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, default="default")  # For multi-tenancy later
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # File info
    type = Column(String, nullable=False)  # csv, pdf, json, xlsx
    file_path = Column(String, nullable=False)  # R2 path or local path
    original_filename = Column(String, nullable=True)
    size_bytes = Column(Integer, default=0)

    # Processing status
    status = Column(String, default="uploading")  # uploading, processing, ready, failed
    error_message = Column(Text, nullable=True)

    # Schema (for structured data)
    row_count = Column(Integer, nullable=True)
    columns = Column(JSON, nullable=True)  # [{name, type, sample_values}]

    # Chunks (for unstructured data)
    chunk_count = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "file_path": self.file_path,
            "original_filename": self.original_filename,
            "size_bytes": self.size_bytes,
            "status": self.status,
            "error_message": self.error_message,
            "row_count": self.row_count,
            "columns": self.columns,
            "chunk_count": self.chunk_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
