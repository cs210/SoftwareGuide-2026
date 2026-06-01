"use client";

import FloorPlanMap from "./components/FloorPlanMap";
import IntroHeader from "./components/IntroHeader";
import { TEAMS } from "@/data/teams";

const HAS_TEAMS = TEAMS.length > 0;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col w-full sm:w-5/6">
        <IntroHeader />
        <div className="flex flex-col items-center px-2 pb-8">
          <FloorPlanMap showTeamLabels={HAS_TEAMS} />
        </div>

        {!HAS_TEAMS && (
          <p className="text-center text-zinc-500 text-sm m-6 px-4">
            Team assignments will appear on the map once data is available.
          </p>
        )}
      </div>
    </main>
  );
}
