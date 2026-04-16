#!/usr/bin/env python3
"""
Seed script to load NZTA test data into the backend.
Run with: python -m scripts.seed_nzta
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import init_db, SessionLocal
from app.models.dataset import Dataset
from app.models.environment import Environment
from app.services.file_parser import parse_json
from app.services.vector_store import add_chunks
import json
import uuid


def seed():
    print("Initializing database...")
    init_db()

    db = SessionLocal()

    # Check if already seeded
    existing = db.query(Dataset).filter(Dataset.name == "NZTA Environment").first()
    if existing:
        print("Already seeded. Skipping.")
        return

    # Load env_sim.json
    nzta_path = os.path.join(os.path.dirname(__file__), "../../NZTA/env_sim.json")
    if not os.path.exists(nzta_path):
        print(f"NZTA data not found at {nzta_path}")
        return

    print("Loading NZTA environment data...")
    with open(nzta_path, "rb") as f:
        content = f.read()

    # Create dataset record
    dataset_id = str(uuid.uuid4())
    dataset = Dataset(
        id=dataset_id,
        name="NZTA Environment",
        description="New Zealand Transport Agency environment simulation data including zones, demographics, and traffic patterns",
        type="json",
        file_path=nzta_path,
        original_filename="env_sim.json",
        size_bytes=len(content),
        status="ready"
    )

    # Parse and extract schema
    parsed = parse_json(content)
    dataset.row_count = parsed.get("row_count")

    db.add(dataset)
    db.commit()
    print(f"Created dataset: {dataset.id}")

    # Load agent schema
    agent_path = os.path.join(os.path.dirname(__file__), "../../NZTA/agent_schema_final.json")
    agent_dataset_id = None
    if os.path.exists(agent_path):
        print("Loading NZTA agent schema...")
        with open(agent_path, "rb") as f:
            agent_content = f.read()

        agent_dataset_id = str(uuid.uuid4())
        agent_dataset = Dataset(
            id=agent_dataset_id,
            name="NZTA Agent Schema",
            description="Agent persona definitions for NZTA simulation",
            type="json",
            file_path=agent_path,
            original_filename="agent_schema_final.json",
            size_bytes=len(agent_content),
            status="ready"
        )

        agent_parsed = parse_json(agent_content)
        agent_dataset.row_count = agent_parsed.get("row_count")

        db.add(agent_dataset)
        db.commit()
        print(f"Created agent dataset: {agent_dataset.id}")

    # Create environment
    print("Creating NZTA environment...")
    env_id = str(uuid.uuid4())

    dataset_ids = [dataset_id]
    if agent_dataset_id:
        dataset_ids.append(agent_dataset_id)

    environment = Environment(
        id=env_id,
        name="NZTA District 7",
        description="New Zealand Transport Agency District 7 simulation environment",
        dataset_ids=dataset_ids,
        status="building"
    )
    db.add(environment)
    db.commit()

    # Create chunks from the data
    data = json.loads(content)

    # Handle different data structures
    chunks = []

    if isinstance(data, dict):
        # If it's a dict, convert each key-value pair to a chunk
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                text = f"{key}:\n{json.dumps(value, indent=2)}"
            else:
                text = f"{key}: {value}"

            chunks.append({
                "id": f"{dataset_id}_{key}",
                "text": text,
                "metadata": {
                    "source_id": dataset_id,
                    "source_name": "NZTA Environment",
                    "key": key
                }
            })
    elif isinstance(data, list):
        # If it's a list, each item becomes a chunk
        for i, item in enumerate(data):
            text = json.dumps(item, indent=2) if isinstance(item, (dict, list)) else str(item)
            chunks.append({
                "id": f"{dataset_id}_item_{i}",
                "text": text,
                "metadata": {
                    "source_id": dataset_id,
                    "source_name": "NZTA Environment",
                    "index": i
                }
            })

    print(f"Created {len(chunks)} chunks")

    # Add to vector store (pgvector)
    try:
        added = add_chunks(env_id, chunks, db)
        environment.chunk_count = added
        environment.status = "ready"
        db.commit()
        print(f"Added {added} chunks to vector store")
    except Exception as e:
        print(f"Warning: Could not add to vector store: {e}")
        print("(This is expected if OpenAI API key is not set)")
        environment.status = "ready"  # Still mark as ready for testing
        db.commit()

    print(f"\nCreated environment: {environment.id}")
    print("\nDone! You can now query the environment.")


if __name__ == "__main__":
    seed()
