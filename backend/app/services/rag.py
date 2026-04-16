"""
RAG service for environment queries
"""

from typing import List, Dict, Any, Optional
import anthropic

from app.config import get_settings
from app.services.vector_store import search

settings = get_settings()

# Anthropic client
claude_client = None
if settings.anthropic_api_key:
    claude_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


SYSTEM_PROMPT = """You are an AI assistant for CMUL8, a simulation platform for policy analysis.
You have access to environment data including demographics, geographic zones, economic indicators, and traffic patterns.

When answering questions:
1. Base your answers on the provided context documents
2. Cite specific data points when available
3. If the context doesn't contain enough information, say so
4. Be concise but informative
5. Use natural language to describe statistics and data

Context documents will be provided in <context> tags."""


def build_context(chunks: List[Dict[str, Any]]) -> str:
    """Build context string from retrieved chunks."""
    context_parts = []
    for i, chunk in enumerate(chunks):
        source = chunk.get("source_name") or chunk.get("metadata", {}).get("source_name", "Unknown")
        context_parts.append(f"[Source: {source}]\n{chunk['text']}")

    return "\n\n---\n\n".join(context_parts)


def query_environment(
    environment_id: str,
    question: str,
    k: int = None
) -> Dict[str, Any]:
    """
    Query an environment using RAG.
    Returns answer with sources.
    """
    if not claude_client:
        raise ValueError("Anthropic API key not configured")

    # Retrieve relevant chunks
    chunks = search(environment_id, question, k=k)

    if not chunks:
        return {
            "answer": "I couldn't find any relevant information in the environment data to answer this question.",
            "sources": [],
            "llm_usage": None
        }

    # Build context
    context = build_context(chunks)

    # Generate answer
    message = claude_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"<context>\n{context}\n</context>\n\nQuestion: {question}"
            }
        ]
    )

    answer = message.content[0].text

    # Format sources
    sources = [
        {
            "chunk_id": c["id"],
            "text": c["text"][:200] + "..." if len(c["text"]) > 200 else c["text"],
            "score": round(c["score"], 3),
            "dataset": c.get("source_name") or "Unknown"
        }
        for c in chunks
    ]

    return {
        "answer": answer,
        "sources": sources,
        "llm_usage": {
            "model": "claude-sonnet-4-20250514",
            "tokens_in": message.usage.input_tokens,
            "tokens_out": message.usage.output_tokens
        }
    }
