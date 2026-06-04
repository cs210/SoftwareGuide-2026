"use client";

import { useMemo } from "react";
import { GENRES } from "@/data/sectionFields";
import {
  getTeamsAtTable,
  getTeamsForGenre,
  groupTeamsByGenre,
} from "@/lib/teamUtils";
import TeamCard from "./TeamCard";
import styles from "./TeamPanel.module.css";

export default function TeamPanel({ teams, activeFilter, selectedTable }) {
  const genreLabels = useMemo(() => GENRES.map((g) => g.label), []);

  const tableTeams = useMemo(
    () => (selectedTable != null ? getTeamsAtTable(teams, selectedTable) : []),
    [teams, selectedTable]
  );

  const filteredTeams = useMemo(
    () => (activeFilter ? getTeamsForGenre(teams, activeFilter) : []),
    [teams, activeFilter]
  );

  const grouped = useMemo(
    () => groupTeamsByGenre(teams, genreLabels),
    [teams, genreLabels]
  );

  if (selectedTable != null) {
    return (
      <section className={styles.panel} aria-labelledby="team-panel-title">
        <h2 id="team-panel-title" className={styles.heading}>
          Table {selectedTable}
        </h2>
        {tableTeams.length === 0 ? (
          <p className={styles.empty}>
            No teams assigned to this table yet.
          </p>
        ) : (
          tableTeams.map((team) => (
            <TeamCard key={`${team.teamNum}-${team.teamName}`} team={team} />
          ))
        )}
      </section>
    );
  }

  if (activeFilter) {
    return (
      <section className={styles.panel} aria-labelledby="team-panel-title">
        <h2 id="team-panel-title" className={styles.heading}>
          {activeFilter}
        </h2>
        {filteredTeams.length === 0 ? (
          <p className={styles.empty}>No teams in this genre yet.</p>
        ) : (
          filteredTeams.map((team) => (
            <TeamCard key={`${team.teamNum}-${team.teamName}`} team={team} />
          ))
        )}
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="team-panel-title">
      <h2 id="team-panel-title" className={styles.heading}>
        All teams by genre
      </h2>
      {genreLabels.map((label) => {
        const sectionTeams = grouped[label] ?? [];
        if (sectionTeams.length === 0) return null;

        return (
          <details key={label} className={styles.genreSection} open>
            <summary className={styles.genreSummary}>{label}</summary>
            <div className={styles.genreBody}>
              {sectionTeams.map((team) => (
                <TeamCard
                  key={`${label}-${team.teamNum}-${team.teamName}`}
                  team={team}
                />
              ))}
            </div>
          </details>
        );
      })}
    </section>
  );
}
