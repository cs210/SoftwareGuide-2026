import { GENRES } from "@/data/sectionFields";
import { TABLE_ZONE_GENRE } from "@/data/tableZones";

const genreColorByLabel = Object.fromEntries(
  GENRES.map((g) => [g.label, g.color])
);

/** Parse "24", "12.a" → 12 for map matching. */
export function parseTableNum(teamNum) {
  const base = String(teamNum).split(".")[0];
  const n = parseInt(base, 10);
  return Number.isNaN(n) ? null : n;
}

export function genreColor(label) {
  return genreColorByLabel[label] ?? "#78716C";
}

export function teamMatchesGenre(team, genreLabel) {
  if (!genreLabel) return true;
  return team.categories.some(
    (c) => c.trim().toLowerCase() === genreLabel.toLowerCase()
  );
}

export function getTeamsAtTable(teams, tableNum) {
  if (tableNum == null) return [];
  return teams.filter((t) => parseTableNum(t.teamNum) === tableNum);
}

/** Genre label + color for a table (from assigned team's primary genre). */
export function getGenreForTable(tableNum, teams) {
  const tableTeams = getTeamsAtTable(teams, tableNum);
  if (tableTeams.length === 0) return null;
  const label =
    tableTeams[0]?.primaryGenre?.trim() || tableTeams[0]?.categories[0]?.trim();
  if (!label) return null;
  return { label, color: genreColor(label) };
}

/** Default zone genre for a table position (unused for fill color). */
export function getZoneGenreForTable(tableNum) {
  return TABLE_ZONE_GENRE[tableNum] ?? null;
}

export function getTeamsForGenre(teams, genreLabel) {
  return teams.filter((t) => teamMatchesGenre(t, genreLabel));
}

/** Group teams under each genre label (team may appear under multiple genres). */
export function groupTeamsByGenre(teams, genreLabels) {
  const groups = {};
  genreLabels.forEach((label) => {
    groups[label] = [];
  });

  teams.forEach((team) => {
    team.categories.forEach((cat) => {
      const key = genreLabels.find(
        (g) => g.toLowerCase() === cat.trim().toLowerCase()
      );
      if (key && !groups[key].some((t) => t.teamName === team.teamName)) {
        groups[key].push(team);
      }
    });
  });

  return groups;
}

export function tableNumbersWithTeams(teams, genreLabel) {
  const filtered = genreLabel ? getTeamsForGenre(teams, genreLabel) : teams;
  return new Set(
    filtered.map((t) => parseTableNum(t.teamNum)).filter((n) => n != null)
  );
}
