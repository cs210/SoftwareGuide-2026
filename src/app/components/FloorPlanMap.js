"use client";

import { useCallback, useMemo, useState } from "react";
import { FLOOR_PLAN_TABLES, MAP_DISPLAY } from "@/data/floorPlanTables";
import {
  getGenreForTable,
  getTeamsAtTable,
  parseTableNum,
  teamMatchesGenre,
} from "@/lib/teamUtils";
import RoomBackground, { ROOM_PATH } from "./RoomBackground";
import MapLegend from "./MapLegend";
import styles from "./FloorPlanMap.module.css";

const ACCENT = "#D03C3B";
const TABLE_SCALE = 1;
const HIT_PAD = 8;

function TableUnit({
  table,
  isSelected,
  isHovered,
  isDimmed,
  onSelect,
  onHover,
  teamName,
  tableGenre,
}) {
  const { cx, cy, w, h, angleDeg, tableNum } = table;
  const tableW = w * TABLE_SCALE;
  const tableH = h * TABLE_SCALE;
  const fieldColor = tableGenre?.color ?? "#94a3b8";
  const fill = fieldColor;
  const stroke = isSelected
    ? ACCENT
    : isHovered && !isDimmed
      ? "rgba(255,255,255,0.85)"
      : "rgba(255,255,255,0.35)";
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
      aria-label={`Table ${tableNum}${tableGenre ? `, ${tableGenre.label}` : ""}${teamName ? `, ${teamName}` : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(tableNum);
        }
      }}
    >
      <g transform={`translate(${cx} ${cy}) rotate(${angleDeg})`}>
        <rect
          x={-tableW / 2 - HIT_PAD}
          y={-tableH / 2 - HIT_PAD}
          width={tableW + HIT_PAD * 2}
          height={tableH + HIT_PAD * 2}
          fill="transparent"
        />
        {isSelected && !isDimmed && (
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
          className={styles.tableShape}
          x={-tableW / 2}
          y={-tableH / 2}
          width={tableW}
          height={tableH}
          rx={5}
          fill={fill}
          stroke={stroke}
          strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
          style={{
            filter: isDimmed
              ? "none"
              : "drop-shadow(0 2px 4px rgb(0 0 0 / 0.18))",
            cursor: isDimmed ? "default" : "pointer",
          }}
        />
      </g>
      <text
        x={cx}
        y={cy + 1}
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
  );
}

export default function FloorPlanMap({
  teams = [],
  activeFilter,
  onFilterChange,
  selectedTable,
  onTableSelect,
}) {
  const [hovered, setHovered] = useState(null);

  const tables = useMemo(
    () => [...FLOOR_PLAN_TABLES].sort((a, b) => a.tableNum - b.tableNum),
    []
  );

  const genreByTable = useMemo(() => {
    const map = {};
    tables.forEach((table) => {
      map[table.tableNum] = getGenreForTable(table.tableNum, teams);
    });
    return map;
  }, [tables, teams]);

  const teamByTable = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      const num = parseTableNum(t.teamNum);
      if (num == null) return;
      if (!map[num]) map[num] = t.teamName;
      else map[num] = `${map[num]}, ${t.teamName}`;
    });
    return map;
  }, [teams]);

  const handleSelect = useCallback(
    (num) => {
      if (selectedTable === num) {
        setHovered(null);
      }
      onTableSelect?.(num);
    },
    [selectedTable, onTableSelect]
  );

  const filteredTableCount = useMemo(() => {
    if (!activeFilter) return null;
    return tables.filter((t) =>
      teams.some(
        (team) =>
          parseTableNum(team.teamNum) === t.tableNum &&
          teamMatchesGenre(team, activeFilter)
      )
    ).length;
  }, [activeFilter, tables, teams]);

  const hint = useMemo(() => {
    if (selectedTable != null) {
      const n = getTeamsAtTable(teams, selectedTable).length;
      return `Table ${selectedTable} · ${n} team${n === 1 ? "" : "s"} below`;
    }
    if (activeFilter) {
      return `${filteredTableCount ?? 0} table${filteredTableCount === 1 ? "" : "s"} with ${activeFilter} teams`;
    }
    return "Filter by genre or click a table · teams listed below";
  }, [selectedTable, activeFilter, filteredTableCount, teams]);

  return (
    <div className={styles.wrapper}>
      <MapLegend activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <div className={styles.card}>
        <svg
          className={styles.svg}
          viewBox={`${MAP_DISPLAY.x} ${MAP_DISPLAY.y} ${MAP_DISPLAY.width} ${MAP_DISPLAY.height}`}
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
            {tables.map((table) => {
              const isSelected = selectedTable === table.tableNum;
              const hasGenreTeam =
                activeFilter &&
                teams.some(
                  (team) =>
                    parseTableNum(team.teamNum) === table.tableNum &&
                    teamMatchesGenre(team, activeFilter)
                );
              const isDimmed =
                activeFilter && !isSelected && !hasGenreTeam;

              return (
                <TableUnit
                  key={table.tableNum}
                  table={table}
                  tableGenre={genreByTable[table.tableNum]}
                  isDimmed={isDimmed && !isSelected}
                  isSelected={isSelected}
                  isHovered={hovered === table.tableNum}
                  onSelect={handleSelect}
                  onHover={setHovered}
                  teamName={teamByTable[table.tableNum]}
                />
              );
            })}
          </g>
        </svg>
        <p className={styles.hint}>{hint}</p>
      </div>
    </div>
  );
}
