"""
Chat API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from app.db.database import get_db
from app.models.message import Conversation, Message
from app.models.environment import Environment
from app.services.rag import query_environment

router = APIRouter()


class SendMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    environment_id: str
    content: str
    mode: str = "query"  # query, survey, simulation


@router.post("/message")
def send_message(
    request: SendMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Send a message and get a response.
    Creates a new conversation if conversation_id is not provided.
    """
    # Validate environment
    environment = db.query(Environment).filter(Environment.id == request.environment_id).first()
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")

    if environment.status != "ready":
        raise HTTPException(status_code=400, detail="Environment is not ready")

    # Get or create conversation
    if request.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            id=str(uuid.uuid4()),
            title=request.content[:50] + "..." if len(request.content) > 50 else request.content,
            mode=request.mode,
            environment_id=request.environment_id
        )
        db.add(conversation)
        db.commit()

    # Save user message
    user_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        role="user",
        content=request.content
    )
    db.add(user_message)
    db.commit()

    # Generate response based on mode
    if request.mode == "query":
        try:
            # Use simple RAG query (fast ~8s)
            result = query_environment(
                environment.id,
                request.content
            )

            assistant_message = Message(
                id=str(uuid.uuid4()),
                conversation_id=conversation.id,
                role="assistant",
                content=result["answer"],
                sources=result.get("sources", []),
                llm_usage=result.get("llm_usage")
            )
            db.add(assistant_message)
            db.commit()

            return {
                "conversation_id": conversation.id,
                "message": assistant_message.to_dict(),
                "sources": result.get("sources", []),
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

    else:
        # For survey/simulation modes - placeholder
        return {
            "conversation_id": conversation.id,
            "message": {
                "role": "assistant",
                "content": f"Mode '{request.mode}' is not yet implemented."
            }
        }


@router.get("/conversations")
def list_conversations(
    project_id: str = "default",
    db: Session = Depends(get_db)
):
    """List all conversations."""
    conversations = db.query(Conversation).filter(
        Conversation.project_id == project_id,
        Conversation.archived == False
    ).order_by(Conversation.created_at.desc()).all()

    return [c.to_dict() for c in conversations]


@router.get("/conversations/{conv_id}")
def get_conversation(conv_id: str, db: Session = Depends(get_db)):
    """Get a conversation with all messages."""
    conversation = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation.to_dict(include_messages=True)


@router.delete("/conversations/{conv_id}")
def delete_conversation(conv_id: str, db: Session = Depends(get_db)):
    """Archive a conversation."""
    conversation = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation.archived = True
    db.commit()

    return {"status": "archived", "id": conv_id}
