"""
RAG service for environment queries
"""

from typing import List, Dict, Any, Optional
import openai
import anthropic

from app.config import get_settings
from app.services.vector_store import search

settings = get_settings()

# Initialize LLM client based on config
llm_client = None
llm_type = settings.analyst_llm
LLM_MODEL = "claude-sonnet-4-20250514"

if llm_type == "doubao" and settings.doubao_api_key:
    llm_client = openai.OpenAI(
        api_key=settings.doubao_api_key,
        base_url=settings.doubao_base_url
    )
    LLM_MODEL = settings.doubao_model
elif llm_type == "moonshot" and settings.moonshot_api_key:
    llm_client = openai.OpenAI(
        api_key=settings.moonshot_api_key,
        base_url=settings.moonshot_base_url
    )
    LLM_MODEL = settings.moonshot_model
elif settings.anthropic_api_key:
    llm_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    llm_type = "claude"


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
    if not llm_client:
        raise ValueError("No LLM API key configured (Doubao, Moonshot, or Anthropic)")

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

    # Generate answer using configured LLM
    if llm_type in ("doubao", "moonshot"):
        # OpenAI-compatible API
        response = llm_client.chat.completions.create(
            model=LLM_MODEL,
            max_tokens=1024,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"<context>\n{context}\n</context>\n\nQuestion: {question}"}
            ]
        )
        answer = response.choices[0].message.content
        usage = {"model": LLM_MODEL, "tokens_in": response.usage.prompt_tokens, "tokens_out": response.usage.completion_tokens}
    else:
        # Anthropic API
        message = llm_client.messages.create(
            model=LLM_MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"<context>\n{context}\n</context>\n\nQuestion: {question}"}]
        )
        answer = message.content[0].text
        usage = {"model": LLM_MODEL, "tokens_in": message.usage.input_tokens, "tokens_out": message.usage.output_tokens}

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
        "llm_usage": usage
    }
