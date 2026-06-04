"use client";

import { useCallback, useMemo, useState } from "react";
import { ZONE_BOUNDS } from "@/data/floorPlanLayout";
import { FLOOR_PLAN_TABLES, MAP_VIEWBOX } from "@/data/floorPlanTables";
import { getFieldForTable } from "@/data/sectionFields";
import { TEAMS } from "@/data/teams";
import RoomBackground, { ROOM_PATH } from "./RoomBackground";
import MapLegend from "./MapLegend";
import styles from "./FloorPlanMap.module.css";

const ACCENT = "#D03C3B";
/** Slightly smaller than layout rects so tables don’t overlap. */
const TABLE_SCALE = 0.88;

function TableUnit({
  table,
  isSelected,
  isHovered,
  isDimmed,
  onSelect,
  onHover,
  showTeamName,
  teamName,
  zoneField,
}) {
  const { cx, cy, w, h, angleDeg, tableNum } = table;
  const active = isSelected || isHovered;
  const tableW = w * TABLE_SCALE;
  const tableH = h * TABLE_SCALE;
  const fieldColor = zoneField?.color ?? "#52525b";
  const fill = fieldColor;
  const stroke = active ? ACCENT : "rgba(255,255,255,0.35)";
  const groupOpacity = isDimmed ? 0.22 : 1;

  return (
    <g
      opacity={groupOpacity}
      className={styles.tableGroup}
      style={{ transition: "opacity 0.2s ease" }}
      onClick={() => onSelect(tableNum)}
      onMouseEnter={() => onHover(tableNum)}
      onMouseLeave={() => onHover(null)}
      role="button"
      tabIndex={isDimmed ? -1 : 0}
      aria-label={`Table ${tableNum}${zoneField ? `, ${zoneField.label}` : ""}${teamName ? `, ${teamName}` : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(tableNum);
        }
      }}
    >
      <g transform={`translate(${cx} ${cy}) rotate(${angleDeg})`}>
        {active && !isDimmed && (
          <rect
            x={-tableW / 2 - 5}
            y={-tableH / 2 - 5}
            width={tableW + 10}
            height={tableH + 10}
            rx={6}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2.5}
            opacity={0.55}
          />
        )}
        <rect
          x={-tableW / 2}
          y={-tableH / 2}
          width={tableW}
          height={tableH}
          rx={5}
          fill={fill}
          stroke={stroke}
          strokeWidth={active ? 2.5 : 1.5}
          style={{
            filter: isDimmed
              ? "none"
              : "drop-shadow(0 2px 4px rgb(0 0 0 / 0.18))",
            cursor: isDimmed ? "default" : "pointer",
          }}
        />
        <text
          x={0}
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={Math.max(12, Math.min(16, tableW * 0.42))}
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {tableNum}
        </text>
      </g>

      {showTeamName && teamName && isHovered && !isDimmed && (
        <g transform={`translate(${cx} ${cy - tableH / 2 - 18})`}>
          <rect
            x={-Math.min(76, teamName.length * 4)}
            y={-11}
            width={Math.min(152, teamName.length * 8)}
            height={22}
            rx={5}
            fill="#1e293b"
          />
          <text
            x={0}
            y={1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#f8fafc"
            fontSize={10}
            fontWeight="500"
          >
            {teamName.length > 18 ? `${teamName.slice(0, 16)}…` : teamName}
          </text>
        </g>
      )}
    </g>
  );
}

export default function FloorPlanMap({ showTeamLabels = false }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const tables = useMemo(
    () => [...FLOOR_PLAN_TABLES].sort((a, b) => a.tableNum - b.tableNum),
    []
  );

  const tablesWithFields = useMemo(
    () =>
      tables.map((table) => ({
        ...table,
        zoneField: getFieldForTable(table.cx, table.cy, ZONE_BOUNDS),
      })),
    [tables]
  );

  const teamByTable = useMemo(() => {
    const map = {};
    if (!Array.isArray(TEAMS)) return map;
    TEAMS.forEach((t) => {
      const num = parseInt(String(t.teamNum).split(".")[0], 10);
      if (!Number.isNaN(num)) map[num] = t.teamName;
    });
    return map;
  }, []);

  const handleSelect = useCallback((num) => {
    setSelected((prev) => (prev === num ? null : num));
  }, []);

  const filteredCount = useMemo(() => {
    if (!activeFilter) return null;
    return tablesWithFields.filter((t) => t.zoneField?.label === activeFilter)
      .length;
  }, [activeFilter, tablesWithFields]);

  return (
    <div className={styles.wrapper}>
      <MapLegend
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className={styles.card}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="CoDa B80 table layout"
        >
          <defs>
            <clipPath id="room-clip">
              <path d={ROOM_PATH} />
            </clipPath>
          </defs>
          <RoomBackground />
          <g clipPath="url(#room-clip)">
            {tablesWithFields.map((table) => {
              const matches =
                !activeFilter || table.zoneField?.label === activeFilter;
              return (
                <TableUnit
                  key={table.tableNum}
                  table={table}
                  zoneField={table.zoneField}
                  isDimmed={!matches}
                  isSelected={selected === table.tableNum}
                  isHovered={hovered === table.tableNum}
                  onSelect={handleSelect}
                  onHover={setHovered}
                  showTeamName={showTeamLabels}
                  teamName={teamByTable[table.tableNum]}
                />
              );
            })}
          </g>
        </svg>
        <p className={styles.hint}>
          {activeFilter
            ? `${filteredCount} table${filteredCount === 1 ? "" : "s"} · ${activeFilter}`
            : "Tap a genre above to filter · click a table to highlight"}
        </p>
      </div>
    </div>
  );
}
