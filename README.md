# Software Fair Guide (2026)

Static interactive floor plan for Stanford's CS 210 Software Fair at **CoDa B80 (Kuang Auditorium)** and the outside patio.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build static site (GitHub Pages)

```bash
npm run build
```

Output is written to `out/` and can be deployed as a static site (GitHub Actions workflow included).

## Live site (GitHub Pages)

**URL:** [https://cs210.github.io/SoftwareGuide-2026/](https://cs210.github.io/SoftwareGuide-2026/)

### First-time setup (repo admin, one time)

The deploy workflow fails with `Get Pages site failed` until GitHub Pages is turned on:

1. Open **Settings → Pages** on [github.com/cs210/SoftwareGuide-2026](https://github.com/cs210/SoftwareGuide-2026)
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Re-run the latest workflow from the **Actions** tab (or push again to `main`)

Org owners may need to allow Pages for the `cs210` organization under **Organization settings → Pages**.

## Project structure

| Path | Purpose |
|------|---------|
| `src/data/floorPlanTables.js` | Table positions (42 tables) — edit or regenerate when layout changes |
| `src/data/teams.js` | Team list for map labels and search (empty for now) |
| `src/app/components/FloorPlanMap.js` | SVG floor plan UI |
| `diagram_drawio.html` | Source diagram for table layout |

## Updating the layout

1. Edit table rectangles in `diagram_drawio.html` (draw.io).
2. Regenerate positions (optional, uses Python in `backend/`):
   ```bash
   cd backend && python3 extract_layout_from_drawio.py
   ```
3. Copy resulting coordinates into `src/data/floorPlanTables.js`, or run the Node snippet in the backend README.

## Adding teams later

Append entries to `src/data/teams.js`:

```js
export const TEAMS = [
  {
    teamName: "Example Project",
    teamNum: "5",
    description: "...",
    categories: ["Education"],
    teamMembers: "Name A, Name B",
    sectionNum: 0,
  },
];
```

The map will show team names on hover when `TEAMS` is non-empty.

## Backend scripts (optional)

The `backend/` folder holds Python helpers used to generate layout data from Google Form CSVs and draw.io. **The live site does not use a server** — only the static files in `src/data/` and `src/app/`.
