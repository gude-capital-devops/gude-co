#!/usr/bin/env python3
"""
Generate a stamp verification QR PNG (and optional composite with a stamp image).

Encodes: {base_url}/verify/{code}  (path form; GitHub Pages 404.html redirects to ?n=)
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import qrcode
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print(
        "Missing dependencies. Install with:\n"
        "  pip install -r scripts/requirements-qr.txt",
        file=sys.stderr,
    )
    sys.exit(1)


def verification_url(base_url: str, code: str) -> str:
    base = base_url.rstrip("/")
    return f"{base}/verify/{code}"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            ]
        )
    else:
        candidates.extend(
            [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            ]
        )
    for path in candidates:
        p = Path(path)
        if p.is_file():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def make_qr_block(code: str, url: str, qr_pixels: int = 280) -> Image.Image:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    qr_img = qr_img.resize((qr_pixels, qr_pixels), Image.Resampling.NEAREST)

    caption_font = load_font(22, bold=False)
    # Measure caption
    probe = Image.new("RGB", (1, 1))
    draw_probe = ImageDraw.Draw(probe)
    bbox = draw_probe.textbbox((0, 0), code, font=caption_font)
    caption_w = bbox[2] - bbox[0]
    caption_h = bbox[3] - bbox[1]

    pad_x, pad_y, gap = 12, 12, 10
    block_w = max(qr_pixels + pad_x * 2, caption_w + pad_x * 2)
    block_h = pad_y + caption_h + gap + qr_pixels + pad_y

    block = Image.new("RGB", (block_w, block_h), "white")
    draw = ImageDraw.Draw(block)
    draw.text((pad_x, pad_y), code, fill="black", font=caption_font)
    block.paste(qr_img, (pad_x, pad_y + caption_h + gap))
    return block


def composite_stamp(
    qr_block: Image.Image,
    stamp_path: Path,
    prototype_label: str | None = None,
) -> Image.Image:
    stamp = Image.open(stamp_path).convert("RGBA")
    stamp_max_h = max(qr_block.height, 320)
    scale = stamp_max_h / stamp.height
    stamp_w = int(stamp.width * scale)
    stamp_h = int(stamp.height * scale)
    stamp = stamp.resize((stamp_w, stamp_h), Image.Resampling.LANCZOS)

    gap = 24
    footer_h = 0
    footer_font = load_font(16, bold=True)
    if prototype_label:
        probe = Image.new("RGB", (1, 1))
        d = ImageDraw.Draw(probe)
        fb = d.textbbox((0, 0), prototype_label, font=footer_font)
        footer_h = (fb[3] - fb[1]) + 28

    canvas_w = qr_block.width + gap + stamp_w
    canvas_h = max(qr_block.height, stamp_h) + footer_h
    canvas = Image.new("RGB", (canvas_w, canvas_h), "white")

    qr_y = 0
    stamp_y = max(0, (qr_block.height - stamp_h) // 2)
    canvas.paste(qr_block, (0, qr_y))
    canvas.paste(stamp, (qr_block.width + gap, stamp_y), stamp)

    if prototype_label:
        draw = ImageDraw.Draw(canvas)
        fb = draw.textbbox((0, 0), prototype_label, font=footer_font)
        tw = fb[2] - fb[0]
        tx = (canvas_w - tw) // 2
        ty = canvas_h - footer_h + 8
        draw.text((tx, ty), prototype_label, fill="#C23034", font=footer_font)

    return canvas


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate a verification QR PNG for Gude engineering stamps."
    )
    parser.add_argument("code", help="Verification code (e.g. PROTO-2026-10-13-001)")
    parser.add_argument(
        "--base-url",
        default="https://gude.co",
        help="Site origin without trailing slash (default: https://gude.co)",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output PNG path (default: ./qr-{code}.png in cwd)",
    )
    parser.add_argument(
        "--stamp",
        type=Path,
        help="Optional stamp PNG to composite to the right of the QR block",
    )
    parser.add_argument(
        "--prototype-label",
        default="",
        help='Optional red footer line (e.g. "PROTOTYPE — NOT FOR SEALING / NOT AUTHORIZED")',
    )
    parser.add_argument(
        "--qr-size",
        type=int,
        default=280,
        help="QR square size in pixels (default: 280)",
    )
    args = parser.parse_args()

    url = verification_url(args.base_url, args.code)
    qr_block = make_qr_block(args.code, url, qr_pixels=args.qr_size)

    if args.stamp:
        if not args.stamp.is_file():
            print(f"Stamp file not found: {args.stamp}", file=sys.stderr)
            return 1
        label = args.prototype_label.strip() or None
        out_img = composite_stamp(qr_block, args.stamp, prototype_label=label)
    else:
        out_img = qr_block

    out_path = args.output or Path(f"qr-{args.code}.png")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_img.save(out_path, format="PNG")
    print(f"Wrote {out_path.resolve()}")
    print(f"URL: {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
