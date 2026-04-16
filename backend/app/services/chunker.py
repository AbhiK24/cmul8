"""
Text chunking service for RAG
"""

from typing import List, Dict, Any, Union
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.config import get_settings

settings = get_settings()


def chunk_text(text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Split text into chunks for embedding.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    chunks = splitter.split_text(text)

    return [
        {
            "id": f"{metadata.get('source_id', 'unknown')}_{i}",
            "text": chunk,
            "metadata": {
                **(metadata or {}),
                "chunk_index": i,
            }
        }
        for i, chunk in enumerate(chunks)
    ]


def chunk_structured_data(data: Any, columns: List[Dict], metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Convert structured data into text chunks for embedding.
    Handles both list of records (CSV) and nested objects (JSON).
    """
    chunks = []

    # If data is a list of records (CSV-style)
    if isinstance(data, list):
        for i, record in enumerate(data):
            if isinstance(record, dict):
                lines = []
                for col in columns:
                    col_name = col["name"]
                    if col_name in record and record[col_name] is not None:
                        value = record[col_name]
                        readable_name = col_name.replace("_", " ").title()
                        lines.append(f"{readable_name}: {value}")
                text = "\n".join(lines)
            else:
                text = str(record)

            chunks.append({
                "id": f"{metadata.get('source_id', 'unknown')}_row_{i}",
                "text": text,
                "metadata": {**(metadata or {}), "row_index": i}
            })

    # If data is a nested object (env JSON style)
    elif isinstance(data, dict):
        chunks.extend(_flatten_nested_dict(data, metadata))

    return chunks


def _flatten_nested_dict(obj: Dict, metadata: Dict[str, Any], prefix: str = "") -> List[Dict[str, Any]]:
    """
    Recursively flatten a nested dict into chunks.
    Each leaf value or small nested structure becomes a chunk.
    """
    chunks = []
    source_id = metadata.get('source_id', 'unknown') if metadata else 'unknown'

    for key, value in obj.items():
        path = f"{prefix}.{key}" if prefix else key

        if isinstance(value, dict):
            # Check if it's a "stat" object with value/source/quote
            if "value" in value and ("source" in value or "quote" in value):
                # This is a named stat - create a chunk
                text_parts = [f"Statistic: {key.replace('_', ' ').title()}"]
                text_parts.append(f"Value: {value.get('value')}")
                if value.get('value_type'):
                    text_parts.append(f"Type: {value.get('value_type')}")
                if value.get('source'):
                    text_parts.append(f"Source: {value.get('source')}")
                if value.get('quote'):
                    text_parts.append(f"Quote: {value.get('quote')}")
                if value.get('notes'):
                    text_parts.append(f"Notes: {value.get('notes')}")

                chunks.append({
                    "id": f"{source_id}_{path.replace('.', '_')}",
                    "text": "\n".join(text_parts),
                    "metadata": {**(metadata or {}), "path": path, "stat_name": key}
                })
            else:
                # Recurse into nested dict
                chunks.extend(_flatten_nested_dict(value, metadata, path))

        elif isinstance(value, list):
            # Handle lists - create chunk for each item or combine small lists
            path_context = path.replace("_", " ").replace(".", " > ").title() if prefix else key.replace('_', ' ').title()
            if len(value) <= 5 and all(isinstance(v, (str, int, float)) for v in value):
                # Small list of primitives - one chunk
                chunks.append({
                    "id": f"{source_id}_{path.replace('.', '_')}",
                    "text": f"{path_context}: {', '.join(str(v) for v in value)}",
                    "metadata": {**(metadata or {}), "path": path}
                })
            else:
                # Larger list - chunk each item
                for i, item in enumerate(value):
                    if isinstance(item, dict):
                        item_text = "\n".join(f"{k}: {v}" for k, v in item.items() if not isinstance(v, (dict, list)))
                        chunks.append({
                            "id": f"{source_id}_{path.replace('.', '_')}_{i}",
                            "text": f"{path_context} [{i+1}]:\n{item_text}",
                            "metadata": {**(metadata or {}), "path": f"{path}[{i}]"}
                        })
                    else:
                        chunks.append({
                            "id": f"{source_id}_{path.replace('.', '_')}_{i}",
                            "text": f"{path_context}: {item}",
                            "metadata": {**(metadata or {}), "path": f"{path}[{i}]"}
                        })

        else:
            # Primitive value - create chunk if substantial
            if value is not None and str(value).strip():
                # Include path context for better semantic search
                path_context = path.replace("_", " ").replace(".", " > ").title() if prefix else ""
                text = f"{path_context}: {value}" if path_context else f"{key.replace('_', ' ').title()}: {value}"
                chunks.append({
                    "id": f"{source_id}_{path.replace('.', '_')}",
                    "text": text,
                    "metadata": {**(metadata or {}), "path": path}
                })

    return chunks


def chunk_pdf_pages(pages: List[Dict], metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Chunk PDF pages, respecting page boundaries but splitting large pages.
    """
    all_chunks = []

    for page in pages:
        page_text = page["text"]
        page_num = page["page_number"]

        if len(page_text) <= settings.chunk_size:
            # Page fits in one chunk
            all_chunks.append({
                "id": f"{metadata.get('source_id', 'unknown')}_page_{page_num}",
                "text": page_text,
                "metadata": {
                    **(metadata or {}),
                    "page_number": page_num
                }
            })
        else:
            # Split page into multiple chunks
            page_chunks = chunk_text(page_text, {
                **(metadata or {}),
                "page_number": page_num
            })
            for j, chunk in enumerate(page_chunks):
                chunk["id"] = f"{metadata.get('source_id', 'unknown')}_page_{page_num}_chunk_{j}"
            all_chunks.extend(page_chunks)

    return all_chunks
