#!/usr/bin/env python3
"""Generate src/data/teams.js from team_data.csv with genre-based table assignment."""

import csv
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "team_data.csv"
OUT_PATH = ROOT / "src" / "data" / "teams.js"

GENRES = [
    "Automotive",
    "Behavior Change/Wellness",
    "Business/Office",
    "Commerce",
    "Education",
    "Finance",
    "Games",
    "Healthcare",
    "Productivity",
    "Research",
    "Security",
    "Social Media",
    "XR",
    "Other",
]

# Default zone genre per table (matches FIELD_ZONES on the floor plan).
TABLE_ZONE_GENRE = {
    **{i: "Behavior Change/Wellness" for i in range(1, 7)},
    **{i: "Education" for i in range(7, 13)},
    **{i: "Healthcare" for i in range(13, 19)},
    **{i: "Social Media" for i in range(19, 25)},
    25: "Automotive",
    26: "Commerce",
    27: "Commerce",
    28: "Games",
    29: "Games",
    30: "Games",
    31: "Research",
    32: "Research",
    33: "Research",
    34: "Business/Office",
    35: "Finance",
    36: "Finance",
    37: "Productivity",
    38: "Productivity",
    39: "Productivity",
    40: "Security",
    41: "Security",
    42: "Security",
}

# Reserve tables for smaller genres first; larger groups fill remaining pools.
GENRE_TABLE_POOLS = {
    "Security": [42],
    "Finance": [35],
    "Productivity": [38],
    "Healthcare": [15],
    "Social Media": [19],
    "Automotive": [25, 26],
    "XR": [29],
    "Other": [28],
    "Research": [31, 32, 33],
    "Behavior Change/Wellness": [1, 2, 3, 4, 5, 6, 7],
    "Education": [8, 9, 10, 11, 12, 13, 14],
    # 14 teams — one table each, no sharing
    "Business/Office": [
        34,
        36,
        37,
        39,
        40,
        41,
        27,
        30,
        16,
        17,
        18,
        20,
        21,
        22,
    ],
}

GENRE_ASSIGN_ORDER = [
    "Security",
    "Finance",
    "Productivity",
    "Healthcare",
    "Social Media",
    "Automotive",
    "XR",
    "Other",
    "Research",
    "Behavior Change/Wellness",
    "Education",
    "Business/Office",
]

CATEGORY_ALIASES = {
    "govtech": "Automotive",
    "art": "Education",
    "music": "Social Media",
    "civic tech": "Business/Office",
    "government/civic engagement": "Business/Office",
    "government": "Business/Office",
    "legal": "Security",
    "insurance": "Finance",
    "robotics": "Research",
    "physical ai": "Research",
    "languages": "Education",
    "messaging": "Social Media",
    "housing and student life": "Education",
    "personal knowledge management / life companion / ai assistant": "Productivity",
}

SKIP_TEAM_NAMES = {"Matthew Torre"}

TEAM_NAME_OVERRIDES = {
    "5": "Nemo",
    "Justin Leong": "Intern Onboarding",
}


def normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip().lower())


def member_fingerprint(name: str) -> str:
    name = normalize_name(name)
    parts = name.split()
    if len(parts) == 1:
        return parts[0]
    first = parts[0]
    last = parts[-1]
    if len(first) == 1:
        return f"{first}.{last}"
    return f"{first[0]}.{last}"


def parse_members(raw: str) -> list[str]:
    parts = re.split(r",|\band\b", raw, flags=re.IGNORECASE)
    return [normalize_name(p) for p in parts if p.strip()]


def member_key(members: list[str]) -> tuple[str, ...]:
    return tuple(sorted({member_fingerprint(m) for m in members}))


def map_category(cat: str) -> str:
    c = cat.strip()
    if not c:
        return "Other"
    for genre in GENRES:
        if genre.lower() == c.lower():
            return genre
    alias = CATEGORY_ALIASES.get(c.lower())
    if alias:
        return alias
    for genre in GENRES:
        if genre.lower() in c.lower() or c.lower() in genre.lower():
            return genre
    return "Other"


def map_categories(categories_str: str) -> list[str]:
    cats = [c.strip() for c in categories_str.split(",") if c.strip()]
    if not cats:
        return ["Other"]
    mapped = [map_category(c) for c in cats]
    seen: set[str] = set()
    unique: list[str] = []
    for genre in mapped:
        if genre not in seen:
            seen.add(genre)
            unique.append(genre)
    return unique


def primary_genre(categories_str: str) -> str:
    cats = [c.strip() for c in categories_str.split(",") if c.strip()]
    if not cats:
        return "Other"
    return map_category(cats[0])


def clean_team_name(name: str) -> str | None:
    name = name.strip()
    if name in SKIP_TEAM_NAMES:
        return None
    if name in TEAM_NAME_OVERRIDES:
        return TEAM_NAME_OVERRIDES[name]
    if re.fullmatch(r"\d+", name):
        return f"Team {name}"
    return name


def load_teams() -> list[dict]:
    rows: list[dict] = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            members_raw = row["Names of individuals on the team"].strip()
            members = parse_members(members_raw)
            team_name = clean_team_name(row["Team Name"].strip())
            if not team_name:
                continue

            categories_raw = row[
                "Please check any genres to which you believe your project belongs"
            ].strip()

            rows.append(
                {
                    "teamName": team_name,
                    "teamMembers": members_raw.replace(";", ","),
                    "members": members,
                    "memberCount": len(set(members)),
                    "description": row[
                        "Please provide a brief description of your project as you wish it to appear in the Software Fair Program Guide"
                    ].strip(),
                    "categories": map_categories(categories_raw),
                    "primaryGenre": primary_genre(categories_raw),
                    "key": member_key(members),
                }
            )

    seen: dict[tuple[str, ...], dict] = {}
    deduped: list[dict] = []
    for team in rows:
        key = team["key"]
        if key not in seen:
            seen[key] = team
            deduped.append(team)
            continue
        existing = seen[key]
        if len(team["teamName"]) > len(existing["teamName"]):
            deduped.remove(existing)
            deduped.append(team)
            seen[key] = team

    for team in deduped:
        if team["teamName"] == "Project Invariant":
            team["teamName"] = "Veracity"
        if team["teamName"] in ("Venn (Team 8)", "Venn"):
            team["teamName"] = "Venn"

    return deduped


def assign_tables(teams: list[dict]) -> list[dict]:
    by_genre: dict[str, list[dict]] = defaultdict(list)
    for team in teams:
        by_genre[team["primaryGenre"]].append(team)

    for genre_teams in by_genre.values():
        genre_teams.sort(key=lambda t: (-t["memberCount"], t["teamName"].lower()))

    used_tables: set[int] = set()
    pool_cursor: dict[str, int] = defaultdict(int)
    assigned: list[dict] = []

    def next_table_for_genre(genre: str) -> int:
        pool = GENRE_TABLE_POOLS[genre]
        idx = pool_cursor[genre]
        while idx < len(pool):
            table = pool[idx]
            pool_cursor[genre] = idx + 1
            idx += 1
            if table not in used_tables:
                used_tables.add(table)
                return table
        for table in range(1, 43):
            if table not in used_tables:
                used_tables.add(table)
                return table
        raise RuntimeError(f"No tables left for {genre}")

    for genre in GENRE_ASSIGN_ORDER:
        for team in by_genre.get(genre, []):
            table = next_table_for_genre(genre)
            assigned.append(
                {
                    "teamName": team["teamName"],
                    "teamNum": str(table),
                    "teamMembers": team["teamMembers"],
                    "description": team["description"],
                    "categories": team["categories"],
                    "primaryGenre": team["primaryGenre"],
                }
            )

    assigned.sort(key=lambda t: int(t["teamNum"]))
    return assigned


def write_teams_js(teams: list[dict]) -> None:
    payload = json.dumps(teams, indent=2, ensure_ascii=False)
    content = (
        "/**\n"
        " * Team roster — generated from team_data.csv (genre-based table assignment).\n"
        " * Regenerate: python3 backend/generate_teams_js.py\n"
        " */\n"
        f"export const TEAMS = {payload};\n"
    )
    OUT_PATH.write_text(content, encoding="utf-8")
    print(f"Wrote {len(teams)} teams to {OUT_PATH}")


if __name__ == "__main__":
    teams = load_teams()
    print(f"Loaded {len(teams)} unique teams")
    assigned = assign_tables(teams)
    write_teams_js(assigned)
