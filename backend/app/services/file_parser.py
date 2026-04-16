"""
File parsing service for different file types
"""

import pandas as pd
import json
from io import BytesIO
from typing import Dict, List, Any, Optional
from pypdf import PdfReader


def parse_csv(data: bytes) -> Dict[str, Any]:
    """
    Parse CSV file and extract schema + data.
    """
    df = pd.read_csv(BytesIO(data))

    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if "int" in dtype:
            col_type = "number"
        elif "float" in dtype:
            col_type = "number"
        elif "datetime" in dtype:
            col_type = "date"
        elif "bool" in dtype:
            col_type = "boolean"
        else:
            col_type = "string"

        columns.append({
            "name": col,
            "type": col_type,
            "sample_values": df[col].dropna().head(3).tolist()
        })

    return {
        "type": "csv",
        "row_count": len(df),
        "columns": columns,
        "data": df.to_dict(orient="records")
    }


def parse_json(data: bytes) -> Dict[str, Any]:
    """
    Parse JSON file.
    """
    content = json.loads(data.decode("utf-8"))

    if isinstance(content, list):
        row_count = len(content)
        # Infer columns from first item
        if row_count > 0 and isinstance(content[0], dict):
            columns = [{"name": k, "type": type(v).__name__} for k, v in content[0].items()]
        else:
            columns = []
    else:
        row_count = 1
        columns = [{"name": k, "type": type(v).__name__} for k, v in content.items()]

    return {
        "type": "json",
        "row_count": row_count,
        "columns": columns,
        "data": content
    }


def parse_pdf(data: bytes) -> Dict[str, Any]:
    """
    Parse PDF file and extract text.
    """
    reader = PdfReader(BytesIO(data))
    pages = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append({
            "page_number": i + 1,
            "text": text
        })

    full_text = "\n\n".join([p["text"] for p in pages])

    return {
        "type": "pdf",
        "page_count": len(pages),
        "pages": pages,
        "full_text": full_text
    }


def parse_xlsx(data: bytes) -> Dict[str, Any]:
    """
    Parse Excel file.
    """
    df = pd.read_excel(BytesIO(data))

    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if "int" in dtype or "float" in dtype:
            col_type = "number"
        elif "datetime" in dtype:
            col_type = "date"
        else:
            col_type = "string"

        columns.append({
            "name": col,
            "type": col_type,
            "sample_values": df[col].dropna().head(3).tolist()
        })

    return {
        "type": "xlsx",
        "row_count": len(df),
        "columns": columns,
        "data": df.to_dict(orient="records")
    }


def parse_file(data: bytes, filename: str) -> Dict[str, Any]:
    """
    Auto-detect file type and parse accordingly.
    """
    ext = filename.lower().split(".")[-1]

    if ext == "csv":
        return parse_csv(data)
    elif ext == "json":
        return parse_json(data)
    elif ext == "pdf":
        return parse_pdf(data)
    elif ext in ["xlsx", "xls"]:
        return parse_xlsx(data)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
