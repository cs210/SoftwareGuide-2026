/**
 * 2026 Software Fair genres — colors for filters, chips, and table fills (via team categories).
 */
export const GENRES = [
  { label: "Automotive", color: "#60A5FA" },
  { label: "Behavior Change/Wellness", color: "#2DD4BF" },
  { label: "Business/Office", color: "#4ADE80" },
  { label: "Commerce", color: "#818CF8" },
  { label: "Education", color: "#A3E635" },
  { label: "Finance", color: "#FB923C" },
  { label: "Games", color: "#A855F7" },
  { label: "Healthcare", color: "#FACC15" },
  { label: "Productivity", color: "#991B1B" },
  { label: "Research", color: "#6366F1" },
  { label: "Security", color: "#D946EF" },
  { label: "Social Media", color: "#38BDF8" },
  { label: "XR", color: "#F59E0B" },
  { label: "Other", color: "#78716C" },
];

/** 3 columns × 4 rows — first 12 genres on the map; XR & Other in filter only until assigned. */
export const FIELD_ZONES = [
  [GENRES[0], GENRES[1], GENRES[2]],
  [GENRES[3], GENRES[4], GENRES[5]],
  [GENRES[6], GENRES[7], GENRES[8]],
  [GENRES[9], GENRES[10], GENRES[11]],
];

export const EXTRA_FIELDS = [];

export function getZoneIndices(cx, cy, bounds) {
  const { x: xBounds, y: yBounds } = bounds;
  let col = 0;
  let row = 0;
  for (let i = 0; i < xBounds.length - 1; i += 1) {
    if (cx >= xBounds[i] && cx < xBounds[i + 1]) col = i;
  }
  for (let i = 0; i < yBounds.length - 1; i += 1) {
    if (cy >= yBounds[i] && cy < yBounds[i + 1]) row = i;
  }
  return { row, col };
}

export function getFieldForTable(cx, cy, bounds) {
  const { row, col } = getZoneIndices(cx, cy, bounds);
  return FIELD_ZONES[row]?.[col] ?? null;
}

export function getAllLegendFields() {
  return GENRES;
}
