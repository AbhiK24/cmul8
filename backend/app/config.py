"""
Application configuration using pydantic-settings
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./data/cmul8.db"

    # Cloudflare R2
    cf_account_id: str = ""
    cf_r2_access_key: str = ""
    cf_r2_secret_key: str = ""
    r2_bucket: str = "cmul8-assets"
    r2_public_url: str = ""

    # AI APIs
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Alternative LLM backends (OpenAI-compatible)
    # BytePlus Seed (Doubao)
    doubao_api_key: str = ""
    doubao_base_url: str = "https://ark.ap-southeast.bytepluses.com/api/v3"
    doubao_model: str = "seed-1-8-251228"

    # Moonshot Kimi
    moonshot_api_key: str = ""
    moonshot_base_url: str = "https://api.moonshot.cn/v1"
    moonshot_model: str = "moonshot-v1-128k"

    # Which LLM to use for data analysis: "claude", "doubao", "moonshot"
    analyst_llm: str = "doubao"

    # App
    env: str = "development"

    # Embedding
    embedding_model: str = "text-embedding-3-small"

    # RAG
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retrieval_k: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
