#!/usr/bin/env python3
"""
Extract table polygons from diagram_drawio.html and write areas.json + layout.csv.
Uses the embedded floor-plan image (800×630) aligned with draw.io geometry.
"""
from __future__ import annotations

import base64
import csv
import html
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DRAWIO_HTML = ROOT / "diagram_drawio.html"
OUT_IMAGE = ROOT / "public" / "software_fair_2026.png"
OUT_AREAS = ROOT / "src/app/components/areas.json"
OUT_LAYOUT = Path(__file__).parent / "data/layout.csv"
OUT_PREVIEW = Path(__file__).parent / "data/layout_preview.jpg"

IMG_OFFSET_X = 50.0
IMG_OFFSET_Y = 230.0
IMG_WIDTH = 800
IMG_HEIGHT = 630
NEUTRAL_COLOR = "#71717a"


def load_drawio_xml() -> str:
    raw = DRAWIO_HTML.read_text(encoding="utf-8")
    start = raw.find('data-mxgraph="') + len('data-mxgraph="')
    end = raw.find('"></div>', start)
    data = json.loads(html.unescape(raw[start:end]))
    return data["xml"]


def extract_floor_plan_png(xml: str) -> bytes:
    idx = xml.find("iVBORw0KGgo")
    end = xml.find('" vertex=', idx)
    return base64.b64decode(xml[idx:end])


def parse_tables(xml: str) -> list[dict]:
    tables = []
    for part in xml.split("<mxCell ")[1:]:
        id_m = re.match(r'id="([^"]*)"', part)
        if not id_m:
            continue
        cid = id_m.group(1)
        if cid in ("0", "1") or "shape=image" in part:
            continue
        if "rounded=1" not in part:
            continue
        style_m = re.search(r'style="([^"]*)"', part)
        style = style_m.group(1) if style_m else ""
        geo_m = re.search(r"<mxGeometry([^>]*)/>", part)
        if not geo_m:
            continue
        geo = geo_m.group(1)

        def g(name: str) -> float:
            mm = re.search(rf'{name}="([^"]*)"', geo)
            return float(mm.group(1)) if mm else 0.0

        rot_m = re.search(r"rotation=(-?\d+)", style)
        rot = float(rot_m.group(1)) if rot_m else 0.0
        tables.append(
            {
                "id": cid,
                "x": g("x"),
                "y": g("y"),
                "w": g("width"),
                "h": g("height"),
                "rot": rot,
            }
        )
    return tables


def rotated_polygon(x: float, y: float, w: float, h: float, rot_deg: float) -> list[int]:
    """Four corners in image coordinates (draw.io rotates around shape center)."""
    cx = x + w / 2
    cy = y + h / 2
    rad = math.radians(rot_deg)
    corners = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    coords: list[int] = []
    for dx, dy in corners:
        rx = dx * math.cos(rad) - dy * math.sin(rad)
        ry = dx * math.sin(rad) + dy * math.cos(rad)
        coords.extend(
            [
                int(round(cx + rx - IMG_OFFSET_X)),
                int(round(cy + ry - IMG_OFFSET_Y)),
            ]
        )
    return coords


def assign_table_numbers(tables: list[dict]) -> list[dict]:
    center = [t for t in tables if abs(t["rot"] + 90) < 1 or t["rot"] == -90]
    left = [t for t in tables if t["rot"] > 0]
    right = [t for t in tables if t["rot"] < 0 and abs(t["rot"] + 90) >= 1]

    def sort_key(t: dict) -> tuple:
        return (round(t["y"], 1), round(t["x"], 1))

    center.sort(key=sort_key)
    left.sort(key=sort_key)
    right.sort(key=sort_key)

    numbered = []
    n = 1
    for group in (center, left, right):
        for t in group:
            t["table_num"] = n
            numbered.append(t)
            n += 1
    return numbered


def write_outputs(tables: list[dict], png_bytes: bytes) -> None:
    OUT_IMAGE.write_bytes(png_bytes)

    areas = []
    rows = []
    for t in tables:
        coords = rotated_polygon(t["x"], t["y"], t["w"], t["h"], t["rot"])
        num = t["table_num"]
        areas.append(
            {
                "name": f"0-Table-{num}",
                "shape": "poly",
                "coords": coords,
                "preFillColor": NEUTRAL_COLOR,
                "fillColor": "#000000",
            }
        )
        rows.append([num, json.dumps(coords)])

    OUT_AREAS.write_text(json.dumps(areas, indent=4) + "\n")
    OUT_LAYOUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT_LAYOUT.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["table_num", "coords"])
        writer.writerows(rows)

    try:
        from PIL import Image, ImageDraw, ImageFont

        img = Image.open(OUT_IMAGE).convert("RGB")
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
        except OSError:
            font = ImageFont.load_default()
        for t in tables:
            coords = rotated_polygon(t["x"], t["y"], t["w"], t["h"], t["rot"])
            pts = [(coords[i], coords[i + 1]) for i in range(0, 8, 2)]
            draw.polygon(pts, outline="#ef4444", width=2)
            cx = sum(coords[0::2]) / 4
            cy = sum(coords[1::2]) / 4
            draw.text((cx - 6, cy - 8), str(t["table_num"]), fill="#ef4444", font=font)
        img.save(OUT_PREVIEW, quality=90)
    except ImportError:
        pass


def main() -> None:
    xml = load_drawio_xml()
    tables = parse_tables(xml)
    if not tables:
        raise SystemExit("No table shapes found in diagram_drawio.html")
    tables = assign_table_numbers(tables)
    png = extract_floor_plan_png(xml)
    write_outputs(tables, png)
    print(f"Extracted {len(tables)} tables from draw.io")
    print(f"Map image: {OUT_IMAGE} ({IMG_WIDTH}×{IMG_HEIGHT})")
    print(f"Wrote {OUT_AREAS} and {OUT_LAYOUT}")


if __name__ == "__main__":
    main()
