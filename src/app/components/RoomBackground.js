import { PATH_RECTS, ROOM_PATH, STAGE } from "@/data/floorPlanLayout";
import { MAP_VIEWBOX } from "@/data/floorPlanTables";

const ROOM_FILL = "#f4f5f7";
const PATH_COLOR = "#94a3b8";
const PATH_THICKNESS = 11;
const BORDER_COLOR = "#cbd5e1";

function PathRect({ cx, cy, w, angleDeg }) {
  return (
    <rect
      x={-w / 2}
      y={-PATH_THICKNESS / 2}
      width={w}
      height={PATH_THICKNESS}
      fill={PATH_COLOR}
      transform={`translate(${cx} ${cy}) rotate(${angleDeg})`}
    />
  );
}

export default function RoomBackground() {
  return (
    <>
      <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill={ROOM_FILL} />

      <g clipPath="url(#room-clip)">
        <path d={ROOM_PATH} fill="#fafbfc" />

        {/* darken blend: overlapping aisles keep the same tint (no stacked opacity) */}
        <g
          style={{ mixBlendMode: "darken", isolation: "isolate" }}
          opacity={0.42}
        >
          {PATH_RECTS.map((r, i) => (
            <PathRect key={i} cx={r.cx} cy={r.cy} w={r.w} angleDeg={r.angleDeg} />
          ))}
        </g>

        <rect
          x={STAGE.x}
          y={STAGE.y}
          width={STAGE.width}
          height={STAGE.height}
          fill="#eef1f5"
          stroke={BORDER_COLOR}
          strokeWidth={1}
          rx={6}
        />
        <text
          x={STAGE.x + STAGE.width / 2}
          y={STAGE.y + STAGE.height / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#64748b"
          fontSize={12}
          fontWeight="600"
          letterSpacing="0.14em"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          STAGE
        </text>
      </g>

      <path
        d={ROOM_PATH}
        fill="none"
        stroke={BORDER_COLOR}
        strokeWidth={2}
        strokeLinejoin="miter"
      />
    </>
  );
}

export { ROOM_PATH };
