/**
 * Project-field colors for each floor-plan zone (3 columns × 4 rows).
 * Edit assignments when the fair publishes official section layout.
 */
export const FIELD_ZONES = [
  [
    { label: "AI", color: "#EF4444" },
    { label: "Automotive", color: "#60A5FA" },
    { label: "Behavior Change/Wellness", color: "#2DD4BF" },
  ],
  [
    { label: "Business/Office", color: "#4ADE80" },
    { label: "Commerce", color: "#818CF8" },
    { label: "Marketing", color: "#EC4899" },
  ],
  [
    { label: "Education", color: "#A3E635" },
    { label: "Finance", color: "#FB923C" },
    { label: "Games", color: "#A855F7" },
  ],
  [
    { label: "Healthcare", color: "#FACC15" },
    { label: "Leisure/Travel", color: "#22D3EE" },
    { label: "Productivity", color: "#991B1B" },
  ],
];

/** Fields not tied to a single zone yet (patio / overflow). */
export const EXTRA_FIELDS = [
  { label: "Social Good", color: "#34D399" },
  { label: "Security", color: "#D946EF" },
  { label: "Social Media", color: "#38BDF8" },
  { label: "XR", color: "#F59E0B" },
];

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
  const zones = FIELD_ZONES.flat();
  return [...zones, ...EXTRA_FIELDS];
}
