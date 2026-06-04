"use client";

import FloorPlanMap from "./components/FloorPlanMap";
import IntroHeader from "./components/IntroHeader";
import { TEAMS } from "@/data/teams";
import styles from "./page.module.css";

const HAS_TEAMS = TEAMS.length > 0;

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <IntroHeader />
        <FloorPlanMap showTeamLabels={HAS_TEAMS} />

        {!HAS_TEAMS && (
          <p className={styles.footnote}>
            Table assignments will be posted on the map closer to the fair.
          </p>
        )}
      </div>
    </main>
  );
}
