"""
File storage service - R2 or local
"""

import os
import boto3
from botocore.config import Config
from typing import Optional
import hashlib

from app.config import get_settings

settings = get_settings()

# R2 Configuration
R2_ENDPOINT = f"https://{settings.cf_account_id}.r2.cloudflarestorage.com"


def get_r2_client():
    """Get boto3 S3 client configured for Cloudflare R2."""
    if not settings.cf_account_id or not settings.cf_r2_access_key:
        return None

    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=settings.cf_r2_access_key,
        aws_secret_access_key=settings.cf_r2_secret_key,
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "adaptive"}
        ),
    )


def upload_file(data: bytes, key: str, content_type: str = "application/octet-stream") -> Optional[str]:
    """
    Upload file to R2 or local storage.
    Returns the storage path/URL.
    """
    client = get_r2_client()

    if client:
        # Upload to R2
        try:
            client.put_object(
                Bucket=settings.r2_bucket,
                Key=f"nzta/{key}",
                Body=data,
                ContentType=content_type
            )
            if settings.r2_public_url:
                return f"{settings.r2_public_url}/nzta/{key}"
            return f"r2://{settings.r2_bucket}/nzta/{key}"
        except Exception as e:
            print(f"[R2] Upload failed: {e}")
            # Fallback to local

    # Local storage
    local_path = f"./data/uploads/{key}"
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, "wb") as f:
        f.write(data)
    return local_path


def download_file(path: str) -> Optional[bytes]:
    """Download file from R2 or local storage."""
    if path.startswith("r2://"):
        # Download from R2
        client = get_r2_client()
        if not client:
            return None
        try:
            bucket, key = path.replace("r2://", "").split("/", 1)
            response = client.get_object(Bucket=bucket, Key=key)
            return response["Body"].read()
        except Exception as e:
            print(f"[R2] Download failed: {e}")
            return None
    elif path.startswith("http"):
        # Public URL - shouldn't need to download
        return None
    else:
        # Local file
        if os.path.exists(path):
            with open(path, "rb") as f:
                return f.read()
        return None


def is_r2_configured() -> bool:
    """Check if R2 is configured."""
    return bool(settings.cf_account_id and settings.cf_r2_access_key and settings.cf_r2_secret_key)
