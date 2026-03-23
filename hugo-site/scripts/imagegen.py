#!/usr/bin/env python3
"""
BytePlus Seedream Image Generation Service
Usage:
    python imagegen.py "your prompt here" output.jpg
    python imagegen.py --blog  # Generate all blog banners
"""

import requests
import sys
import os
from pathlib import Path

API_URL = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations"
API_KEY = os.environ.get("BYTEPLUS_API_KEY")
MODEL = "seedream-5-0-260128"

if not API_KEY:
    print("Error: Set BYTEPLUS_API_KEY environment variable")
    sys.exit(1)

def generate_image(prompt: str, output_path: str, size: str = "2K", watermark: bool = False) -> str:
    """Generate an image using BytePlus Seedream API"""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "response_format": "url",
        "size": size,
        "stream": False,
        "watermark": watermark
    }

    print(f"Generating: {prompt[:50]}...")
    response = requests.post(API_URL, headers=headers, json=payload, timeout=120)

    if response.status_code != 200:
        print(f"Error: {response.text}")
        return None

    data = response.json()
    image_url = data["data"][0]["url"]

    # Download the image
    img_response = requests.get(image_url, timeout=60)
    if img_response.status_code == 200:
        # Ensure directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(img_response.content)
        print(f"Saved: {output_path}")
        return output_path
    else:
        print(f"Failed to download image")
        return None


def generate_blog_banners():
    """Generate banners for all blog posts"""

    base_path = Path(__file__).parent.parent / "static" / "images" / "blog"

    banners = [
        {
            "prompt": "Abstract geometric montage illustration, difficult conversation between two silhouettes, tension and resolution, muted earth tones brown and grey, minimalist editorial style, professional, no text, artistic",
            "output": base_path / "negative-feedback.jpg"
        },
        {
            "prompt": "Abstract geometric montage illustration, leadership growth journey, stepping stones ascending, warm amber and orange tones fading to purple, minimalist editorial style, professional, no text, artistic",
            "output": base_path / "first-time-manager.jpg"
        },
        {
            "prompt": "Abstract geometric montage illustration, boundaries and balance, shield or barrier concept, cool blue and teal tones, minimalist editorial style, professional, no text, artistic",
            "output": base_path / "say-no.jpg"
        }
    ]

    for banner in banners:
        generate_image(banner["prompt"], str(banner["output"]))

    print("\nAll blog banners generated!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python imagegen.py 'prompt' output.jpg")
        print("  python imagegen.py --blog")
        sys.exit(1)

    if sys.argv[1] == "--blog":
        generate_blog_banners()
    elif len(sys.argv) >= 3:
        generate_image(sys.argv[1], sys.argv[2])
    else:
        print("Error: Need output path")
        print("  python imagegen.py 'prompt' output.jpg")
