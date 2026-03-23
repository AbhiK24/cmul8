#!/usr/bin/env python3
"""
BytePlus Seedream Image Generation Service
Usage:
    python imagegen.py "your prompt here" output.jpg
    python imagegen.py --blog  # Generate all blog banners
    python imagegen.py --ref image.png "prompt" output.jpg  # With reference image
"""

import requests
import sys
import os
import base64
from pathlib import Path

API_URL = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations"
API_KEY = os.environ.get("BYTEPLUS_API_KEY")
MODEL = "seedream-5-0-260128"

if not API_KEY:
    print("Error: Set BYTEPLUS_API_KEY environment variable")
    sys.exit(1)

def image_to_base64(image_path: str) -> str:
    """Convert image file to base64 data URI"""
    with open(image_path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    ext = Path(image_path).suffix.lower()
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}.get(ext[1:], "image/png")
    return f"data:{mime};base64,{data}"

def generate_image(prompt: str, output_path: str, size: str = "2K", watermark: bool = False, reference_image: str = None) -> str:
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

    if reference_image:
        payload["image"] = [image_to_base64(reference_image)]
        print(f"Using reference: {reference_image}")

    print(f"Generating: {prompt[:60]}...")
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
    """Generate banners for all blog posts using montage collage style"""

    base_path = Path(__file__).parent.parent / "static" / "images" / "blog"
    ref_image = Path(__file__).parent.parent.parent / "reference.png"

    # Montage collage style prompts inspired by reference
    banners = [
        {
            "prompt": "Editorial collage montage style, vintage paper texture background, two business people in difficult conversation, speech bubbles, red and black geometric accents, cut-out photography style, retro magazine aesthetic, cream background, no text",
            "output": base_path / "negative-feedback.jpg"
        },
        {
            "prompt": "Editorial collage montage style, vintage paper texture background, person climbing ladder of success, desk and office elements, red geometric rectangle accent, black circle, cut-out photography style, retro magazine aesthetic, cream background, no text",
            "output": base_path / "first-time-manager.jpg"
        },
        {
            "prompt": "Editorial collage montage style, vintage paper texture background, person with shield or boundary gesture, workplace scene, red and black geometric shapes, cut-out photography style, retro magazine aesthetic, cream background, no text",
            "output": base_path / "say-no.jpg"
        }
    ]

    for banner in banners:
        generate_image(banner["prompt"], str(banner["output"]), reference_image=str(ref_image) if ref_image.exists() else None)

    print("\nAll blog banners generated!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python imagegen.py 'prompt' output.jpg")
        print("  python imagegen.py --ref image.png 'prompt' output.jpg")
        print("  python imagegen.py --blog")
        sys.exit(1)

    if sys.argv[1] == "--blog":
        generate_blog_banners()
    elif sys.argv[1] == "--ref" and len(sys.argv) >= 5:
        generate_image(sys.argv[3], sys.argv[4], reference_image=sys.argv[2])
    elif len(sys.argv) >= 3:
        generate_image(sys.argv[1], sys.argv[2])
    else:
        print("Error: Invalid arguments")
        print("  python imagegen.py 'prompt' output.jpg")
        print("  python imagegen.py --ref image.png 'prompt' output.jpg")
