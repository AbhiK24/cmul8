"""
Conversation and Message models
"""

from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, default="default")
    title = Column(String, default="New conversation")
    mode = Column(String, default="query")  # survey, query, simulation

    # Context
    environment_id = Column(String, nullable=True)

    archived = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    messages = relationship("Message", back_populates="conversation")

    def to_dict(self, include_messages=False):
        data = {
            "id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "mode": self.mode,
            "environment_id": self.environment_id,
            "archived": self.archived,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_messages:
            data["messages"] = [m.to_dict() for m in self.messages]
        return data


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)

    role = Column(String, nullable=False)  # user, assistant
    content = Column(Text, nullable=False)

    # For assistant messages
    sources = Column(JSON, nullable=True)  # [{chunk_id, text, score, dataset}]

    # LLM usage
    llm_usage = Column(JSON, nullable=True)  # {model, tokens_in, tokens_out}

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "sources": self.sources,
            "llm_usage": self.llm_usage,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
