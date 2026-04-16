"""
CMUL8 Backend API
FastAPI application for ENV RAG Q&A
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.db.database import init_db
from app.api import datasets, environments, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    settings = get_settings()
    print(f"Starting CMUL8 Backend ({settings.env})")
    init_db()
    yield
    # Shutdown
    print("Shutting down CMUL8 Backend")


app = FastAPI(
    title="CMUL8 API",
    description="Backend API for CMUL8 simulation platform",
    version="0.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(environments.router, prefix="/api/environments", tags=["Environments"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
def root():
    return {"status": "ok", "service": "cmul8-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}
