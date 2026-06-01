#!/usr/bin/env python3
"""Extract tables + path rectangles from finallayout.html."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DRAWIO = ROOT / "finallayout.html"
OUT_TABLES = ROOT / "src/data/floorPlanTables.js"
OUT_LAYOUT = ROOT / "src/data/floorPlanLayout.js"
IMG_OX, IMG_OY = 50.0, 230.0
# Shift layout right so left-wing tables stay inside the room clip.
LAYOUT_OFFSET_X = 12.0
STAGE = {"x": 130, "y": 94, "width": 540, "height": 58}


def load_xml() -> str:
    raw = DRAWIO.read_text(encoding="utf-8")
    start = raw.find('data-mxgraph="') + len('data-mxgraph="')
    end = raw.find('"></div>', start)
    if end == -1:
        end = raw.find('"></div>', start)
    return json.loads(html.unescape(raw[start:end]))["xml"]


def parse_tables(xml: str) -> list[dict]:
    tables = []
    for part in xml.split("<mxCell ")[1:]:
        if "rounded=1" not in part or "shape=image" in part:
            continue
        geo_m = re.search(r"<mxGeometry([^>]*)/>", part)
        style_m = re.search(r'style="([^"]*)"', part)
        if not geo_m:
            continue
        geo = geo_m.group(1)

        def g(name: str) -> float:
            m = re.search(rf'{name}="([^"]*)"', geo)
            return float(m.group(1)) if m else 0.0

        rot_m = re.search(r"rotation=(-?\d+)", style_m.group(1) if style_m else "")
        rot = float(rot_m.group(1)) if rot_m else 0.0
        x, y, w, h = g("x"), g("y"), g("width"), g("height")
        tables.append(
            {
                "w": w,
                "h": h,
                "rot": rot,
                "cx": x + w / 2 - IMG_OX,
                "cy": y + h / 2 - IMG_OY,
            }
        )

    center = sorted(
        [t for t in tables if abs(t["rot"] + 90) < 1], key=lambda t: (t["cy"], t["cx"])
    )
    left = sorted([t for t in tables if t["rot"] > 0], key=lambda t: (t["cy"], t["cx"]))
    right = sorted(
        [t for t in tables if t["rot"] < 0 and abs(t["rot"] + 90) >= 1],
        key=lambda t: (t["cy"], t["cx"]),
    )

    numbered = []
    for i, t in enumerate(center, 1):
        numbered.append({**t, "tableNum": i, "section": "center"})
    for i, t in enumerate(left, 25):
        numbered.append({**t, "tableNum": i, "section": "left"})
    for i, t in enumerate(right, 34):
        numbered.append({**t, "tableNum": i, "section": "right"})
    return sorted(numbered, key=lambda t: t["tableNum"])


def parse_path_rects(xml: str) -> list[dict]:
    """Thin rounded=0 rectangles drawn as aisle paths in finallayout.html."""
    rects = []
    for part in xml.split("<mxCell ")[1:]:
        style_m = re.search(r'style="([^"]*)"', part)
        style = style_m.group(1) if style_m else ""
        if "rounded=0" not in style or "whiteSpace=wrap" not in style:
            continue
        geo_m = re.search(r"<mxGeometry([^>]*)/>", part)
        if not geo_m:
            continue
        geo = geo_m.group(1)

        def g(name: str) -> float:
            m = re.search(rf'{name}="([^"]*)"', geo)
            return float(m.group(1)) if m else 0.0

        x, y, w, h = g("x"), g("y"), g("width"), g("height")
        rot_m = re.search(r"rotation=(-?\d+)", style)
        rot = float(rot_m.group(1)) if rot_m else 0.0
        rects.append(
            {
                "cx": round(x + w / 2 - IMG_OX + LAYOUT_OFFSET_X, 2),
                "cy": round(y + h / 2 - IMG_OY, 2),
                "w": round(w, 2),
                "h": round(h, 2),
                "angleDeg": rot,
            }
        )
    return rects


def zone_bounds(path_rects: list[dict]) -> dict:
    horiz = sorted(r["cy"] for r in path_rects if r["angleDeg"] == 0)
    vert = sorted(r["cx"] for r in path_rects if abs(r["angleDeg"] + 90) < 1)
    return {
        "y": [158, *[round(y, 1) for y in horiz], 605],
        "x": [78 + LAYOUT_OFFSET_X, *[round(x + LAYOUT_OFFSET_X, 1) for x in vert], 722 + LAYOUT_OFFSET_X],
    }


def write_tables_js(tables: list[dict]) -> None:
    lines = [
        "/** Auto-generated from finallayout.html */",
        "export const MAP_VIEWBOX = { width: 800, height: 630 };",
        "export const STAGE = { x: %d, y: %d, width: %d, height: %d };"
        % (
            STAGE["x"] + int(LAYOUT_OFFSET_X),
            STAGE["y"],
            STAGE["width"],
            STAGE["height"],
        ),
        "",
        "export const FLOOR_PLAN_TABLES = [",
    ]
    for t in tables:
        lines.append(
            f'  {{ tableNum: {t["tableNum"]}, section: "{t["section"]}", '
            f'cx: {t["cx"] + LAYOUT_OFFSET_X:.1f}, cy: {t["cy"]:.1f}, w: {t["w"]:.0f}, h: {t["h"]:.0f}, '
            f'angleDeg: {t["rot"]:.0f} }},'
        )
    lines.append("];\n")
    OUT_TABLES.write_text("\n".join(lines))


def write_layout_js(path_rects: list[dict], zones: dict) -> None:
    rects_js = json.dumps(path_rects, indent=2)
    content = f"""/** Path guide rectangles from finallayout.html */
export const MAP_VIEWBOX = {{ width: 800, height: 630 }};
export const STAGE = {{ x: {STAGE["x"] + int(LAYOUT_OFFSET_X)}, y: {STAGE["y"]}, width: {STAGE["width"]}, height: {STAGE["height"]} }};

export const PATH_RECTS = {rects_js};

export const ZONE_BOUNDS = {{
  y: {json.dumps(zones["y"])},
  x: {json.dumps(zones["x"])},
}};

export const ROOM_PATH =
  "M 72 88 L 728 88 L 752 612 L 400 628 L 48 612 Z";
"""
    OUT_LAYOUT.write_text(content)


def main() -> None:
    xml = load_xml()
    tables = parse_tables(xml)
    path_rects = parse_path_rects(xml)
    zones = zone_bounds(path_rects)
    write_tables_js(tables)
    write_layout_js(path_rects, zones)
    print(f"Wrote {len(tables)} tables, {len(path_rects)} path rects")
    for r in path_rects:
        print(f"  cy={r['cy']} cx={r['cx']} rot={r['angleDeg']} w={r['w']}")


if __name__ == "__main__":
    main()
