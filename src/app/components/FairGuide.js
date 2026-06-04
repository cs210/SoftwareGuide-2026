"use client";

import { useCallback, useState } from "react";
import { TEAMS } from "@/data/teams";
import FloorPlanMap from "./FloorPlanMap";
import TeamPanel from "./TeamPanel";

export default function FairGuide() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const handleFilterChange = useCallback((genre) => {
    setActiveFilter(genre);
    setSelectedTable(null);
  }, []);

  const handleTableSelect = useCallback((tableNum) => {
    setSelectedTable((prev) => {
      const next = prev === tableNum ? null : tableNum;
      if (next != null) setActiveFilter(null);
      return next;
    });
  }, []);

  return (
    <>
      <FloorPlanMap
        teams={TEAMS}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        selectedTable={selectedTable}
        onTableSelect={handleTableSelect}
      />
      <TeamPanel
        teams={TEAMS}
        activeFilter={activeFilter}
        selectedTable={selectedTable}
      />
    </>
  );
}
