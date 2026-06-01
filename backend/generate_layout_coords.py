#!/usr/bin/env python3
"""
Generate table polygon coordinates for CoDa B80 floor plan.
Run from backend/: python3 generate_layout_coords.py
"""
import csv
import json
import math
from pathlib import Path

IMG_PATH = Path(__file__).resolve().parents[1] / "table_layout.jpg"
OUT_CSV = Path(__file__).parent / "data" / "layout.csv"
OUT_JSON = Path(__file__).resolve().parents[1] / "src/app/components/areas.json"
PREVIEW_PATH = Path(__file__).parent / "data" / "layout_preview.jpg"

# Image dimensions (must match table_layout.jpg)
IMG_W, IMG_H = 3072, 4080

# Neutral gray for tables without team assignments
NEUTRAL_COLOR = "#71717a"

# Skew angle matching the floor plan perspective (radians)
SKEW = -0.32

# Table unit size in image pixels (matches drawn table clusters on floor plan)
TABLE_W = 64
TABLE_H = 38


def make_parallelogram(cx, cy, w=TABLE_W, h=TABLE_H, skew=SKEW):
    """Return 8 coords (x1,y1,...,x4,y4) for a table parallelogram."""
    hw, hh = w / 2, h / 2
    corners = [(-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh)]
    coords = []
    for dx, dy in corners:
        sx = dx + dy * math.tan(skew) * 0.35
        coords.extend([int(cx + sx), int(cy + dy)])
    return coords


def table_positions():
    """
    Return list of (table_num, cx, cy) for all 46 B80 tables.
    Numbering: center 1–32 (front row near stage → back), left wing 33–39, right wing 40–46.
    Coordinates tuned to table_layout.jpg (stage / podium at top).
    """
    positions = []
    row_gap = 168
    wing_row_counts = [1, 2, 2, 2]

    # --- Center section (32 tables: 4 rows × 8, front row closest to stage) ---
    center_x_start = 1310
    center_x_gap = 86
    center_y_start = 1188
    for row in range(4):
        cy = center_y_start + row * row_gap
        for col in range(8):
            cx = center_x_start + col * center_x_gap
            positions.append((row * 8 + col + 1, cx, cy))

    # --- Left wing (7 tables), front row near stage ---
    left_row_x = [1095, 1068, 1042, 1016]
    left_y_start = 1210
    n = 33
    for row_idx, count in enumerate(wing_row_counts):
        cy = left_y_start + row_idx * row_gap
        for i in range(count):
            cx = left_row_x[row_idx] - i * 52
            positions.append((n, cx, cy))
            n += 1

    # --- Right wing (7 tables) ---
    right_row_x = [2105, 2132, 2158, 2184]
    n = 40
    for row_idx, count in enumerate(wing_row_counts):
        cy = left_y_start + row_idx * row_gap
        for i in range(count):
            cx = right_row_x[row_idx] + i * 52
            positions.append((n, cx, cy))
            n += 1

    return sorted(positions, key=lambda p: p[0])


def write_layout_csv(positions):
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_CSV, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["table_num", "coords"])
        for num, cx, cy in positions:
            coords = make_parallelogram(cx, cy)
            writer.writerow([num, json.dumps(coords)])


def write_areas_json(positions):
    areas = []
    for num, cx, cy in positions:
        coords = make_parallelogram(cx, cy)
        areas.append(
            {
                "name": f"0-Table-{num}",
                "shape": "poly",
                "coords": coords,
                "preFillColor": NEUTRAL_COLOR,
                "fillColor": "#000000",
            }
        )
    with open(OUT_JSON, "w") as f:
        json.dump(areas, f, indent=4)


def write_preview(positions):
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Skipping preview (install pillow in a venv to generate layout_preview.jpg)")
        return

    img = Image.open(IMG_PATH).convert("RGB")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    except OSError:
        font = ImageFont.load_default()

    for num, cx, cy in positions:
        coords = make_parallelogram(cx, cy)
        pts = [(coords[i], coords[i + 1]) for i in range(0, 8, 2)]
        draw.polygon(pts, outline="#ef4444", width=2)
        draw.text((cx - 10, cy - 14), str(num), fill="#ef4444", font=font)

    img.save(PREVIEW_PATH, quality=90)
    print(f"Preview saved to {PREVIEW_PATH}")


def main():
    positions = table_positions()
    assert len(positions) == 46, f"Expected 46 tables, got {len(positions)}"
    write_layout_csv(positions)
    write_areas_json(positions)
    write_preview(positions)
    print(f"Wrote {len(positions)} tables to {OUT_CSV} and areas.json")


if __name__ == "__main__":
    main()
