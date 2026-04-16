"""
Text chunking service for RAG
"""

from typing import List, Dict, Any
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


def chunk_structured_data(records: List[Dict], columns: List[Dict], metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Convert structured data (CSV rows) into text chunks for embedding.
    Each row becomes a chunk with natural language representation.
    """
    chunks = []

    for i, record in enumerate(records):
        # Convert record to natural language
        lines = []
        for col in columns:
            col_name = col["name"]
            if col_name in record and record[col_name] is not None:
                value = record[col_name]
                # Clean up column name for readability
                readable_name = col_name.replace("_", " ").title()
                lines.append(f"{readable_name}: {value}")

        text = "\n".join(lines)

        chunks.append({
            "id": f"{metadata.get('source_id', 'unknown')}_row_{i}",
            "text": text,
            "metadata": {
                **(metadata or {}),
                "row_index": i,
                "record": record
            }
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
