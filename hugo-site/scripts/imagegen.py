#!/usr/bin/env python3
"""
cmul8 Image Generation Pipeline

Two-stage approach:
1. Analyze reference images with vision model to extract style
2. Generate original images from scratch using style description + content prompt

Usage:
    python imagegen.py --blog                    # Generate all blog banners
    python imagegen.py --analyze ref.png         # Analyze a reference image
    python imagegen.py "prompt" output.jpg       # Generate single image
"""

import requests
import base64
import sys
import os
import json
from pathlib import Path

# BytePlus API Configuration
API_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3"
API_KEY = os.environ.get("BYTEPLUS_API_KEY")

# Models
VISION_MODEL = "seed-2-0-lite-260228"  # For style analysis (supports vision)
IMAGE_MODEL = "seedream-5-0-260128"  # For generation

if not API_KEY:
    print("Error: Set BYTEPLUS_API_KEY environment variable")
    sys.exit(1)


def image_to_base64(image_path: str) -> str:
    """Convert image file to base64 data URI"""
    with open(image_path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    ext = Path(image_path).suffix.lower().lstrip('.')
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(ext, "image/png")
    return f"data:{mime};base64,{data}"


def analyze_style(reference_images: list) -> str:
    """
    Stage 1: Analyze reference images to extract style description
    Returns a detailed style prompt for image generation
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    # Build content with all reference images
    content = []
    for img_path in reference_images:
        content.append({
            "type": "image_url",
            "image_url": {"url": image_to_base64(img_path)}
        })

    content.append({
        "type": "text",
        "text": """Analyze these editorial collage/montage illustrations and describe their visual style in detail.

Focus on:
1. Color palette (specific colors, tones, contrast)
2. Composition style (layering, arrangement, negative space)
3. Texture and materials (paper, printing effects, grain)
4. Figure treatment (how people are depicted - cutout style, scale, positioning)
5. Geometric elements (shapes, lines, accents)
6. Overall aesthetic mood

Output a concise style description (2-3 sentences) that could be used as a prompt to generate NEW, ORIGINAL images in this same aesthetic. Do NOT describe the specific content of these images - only the visual style and technique."""
    })

    payload = {
        "model": VISION_MODEL,
        "messages": [{"role": "user", "content": content}],
        "max_tokens": 500
    }

    print("Analyzing reference styles...")
    response = requests.post(
        f"{API_BASE}/chat/completions",
        headers=headers,
        json=payload,
        timeout=60
    )

    if response.status_code != 200:
        print(f"Vision API error: {response.text}")
        return None

    result = response.json()
    style_description = result["choices"][0]["message"]["content"]
    print(f"Style extracted: {style_description[:100]}...")
    return style_description


def generate_image(content_prompt: str, style_prompt: str, output_path: str) -> str:
    """
    Stage 2: Generate original image from scratch using content + style prompts
    NO reference images passed - purely text-to-image
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    # Combine style and content into a detailed prompt
    full_prompt = f"""{style_prompt}

Subject matter: {content_prompt}

Important: Create an original artistic composition. Include human figures prominently. No text or watermarks."""

    payload = {
        "model": IMAGE_MODEL,
        "prompt": full_prompt,
        "response_format": "url",
        "size": "2K",
        "stream": False,
        "watermark": False
        # NO "image" parameter - generating from scratch
    }

    print(f"Generating: {content_prompt[:50]}...")
    response = requests.post(
        f"{API_BASE}/images/generations",
        headers=headers,
        json=payload,
        timeout=120
    )

    if response.status_code != 200:
        print(f"Generation error: {response.text}")
        return None

    data = response.json()
    image_url = data["data"][0]["url"]

    # Download the image
    img_response = requests.get(image_url, timeout=60)
    if img_response.status_code == 200:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(img_response.content)
        print(f"Saved: {output_path}")
        return output_path
    return None


def generate_blog_banners():
    """Generate all blog banners using editorial montage style"""

    output_dir = Path(__file__).parent.parent / "static" / "images" / "blog"

    # Pre-analyzed style from reference montage images:
    # - Cream/beige textured paper backgrounds with subtle grain
    # - Bold red rectangles and black circles as geometric accents
    # - Vintage black-and-white cutout photography of human figures
    # - Layered composition with overlapping elements
    # - Editorial magazine collage aesthetic
    # - Muted earth tones with pops of saturated red

    style = """Editorial collage montage illustration style. Cream-colored textured paper background with subtle grain and speckles.
Bold geometric shapes as accents: red rectangles and black circles. Human figures rendered in vintage black-and-white
cutout photography style with white outlines, positioned dynamically in layered compositions. Retro magazine aesthetic
with overlapping visual elements. Color palette: cream, black, muted grays, with bold red accents.
No photorealistic rendering - maintain illustrated collage look with visible paper textures and cut edges."""

    print(f"Using pre-analyzed montage style")
    print(f"{'='*60}\n")

    # Generate original banners from scratch (NO reference images)
    banners = [
        {
            "content": "Two business professionals in suits having an intense face-to-face conversation, speech bubbles between them, one gesturing while speaking, the other listening intently",
            "output": output_dir / "negative-feedback.jpg"
        },
        {
            "content": "Person in business attire climbing a tall ladder, reaching toward the top, smaller figures of team members below looking up, desk and office items scattered artistically",
            "output": output_dir / "first-time-manager.jpg"
        },
        {
            "content": "Confident professional with hand raised in stop gesture, papers and documents floating around them, maintaining calm composure amid chaos, clock elements showing time pressure",
            "output": output_dir / "say-no.jpg"
        }
    ]

    for banner in banners:
        generate_image(banner["content"], style, str(banner["output"]))

    print("\nAll blog banners generated!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--blog":
        generate_blog_banners()
    elif sys.argv[1] == "--analyze":
        if len(sys.argv) < 3:
            print("Usage: python imagegen.py --analyze image.png")
            sys.exit(1)
        style = analyze_style([sys.argv[2]])
        if style:
            print(f"\nStyle description:\n{style}")
    elif len(sys.argv) >= 3:
        # Simple generation with default style
        default_style = "Editorial collage montage style with vintage paper texture, bold geometric shapes, cutout photography aesthetic, muted earth tones with red and black accents"
        generate_image(sys.argv[1], default_style, sys.argv[2])
    else:
        print("Error: Need output path")
        print("Usage: python imagegen.py 'prompt' output.jpg")
