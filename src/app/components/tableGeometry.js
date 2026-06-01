/** Parse image-map polygon coords into table center, size, and rotation (degrees). */
export function polygonToTable(coords) {
  const pts = [];
  for (let i = 0; i < coords.length; i += 2) {
    pts.push({ x: coords[i], y: coords[i + 1] });
  }

  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;

  const dx = pts[1].x - pts[0].x;
  const dy = pts[1].y - pts[0].y;
  const w = Math.hypot(dx, dy);
  const dx2 = pts[2].x - pts[1].x;
  const dy2 = pts[2].y - pts[1].y;
  const h = Math.hypot(dx2, dy2);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { cx, cy, w, h, angleDeg };
}

function centerRow(tableNum) {
  return Math.floor((tableNum - 1) / 6);
}

function wingTableTier(tableNum) {
  if (tableNum === 25 || tableNum === 34) return 0;
  if (tableNum <= 27 || tableNum <= 36) return 1;
  if (tableNum <= 30 || tableNum <= 39) return 2;
  return 3;
}

/**
 * Spread tables to match auditorium aisles: wing gaps + horizontal breaks
 * between center row groups (esp. before back row).
 */
export function applyAisleSpacing(tables) {
  const rowDy = [0, 20, 20, 50];

  return tables.map((t) => {
    let { cx, cy } = t;
    const row =
      t.section === "center" ? centerRow(t.tableNum) : wingTableTier(t.tableNum);

    cy += rowDy[row] + 14;

    if (t.section === "left") cx -= 32;
    if (t.section === "right") cx += 32;

    return { ...t, cx, cy, row };
  });
}

export function parseAreas(areas) {
  const parsed = areas.map((area) => {
    const nameParts = area.name.split("-");
    const tableNum = parseInt(nameParts[nameParts.length - 1], 10);
    const geom = polygonToTable(area.coords);
    let section = "center";
    if (tableNum >= 34) section = "right";
    else if (tableNum >= 25) section = "left";

    return {
      tableNum,
      section,
      fillColor: area.preFillColor,
      ...geom,
    };
  });

  return applyAisleSpacing(parsed);
}

export const MAP_VIEWBOX = { width: 800, height: 700 };
