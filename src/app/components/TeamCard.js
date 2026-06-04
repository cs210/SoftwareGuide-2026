"use client";

import { useState } from "react";
import { genreColor } from "@/lib/teamUtils";
import styles from "./TeamCard.module.css";

export default function TeamCard({ team }) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <article className={styles.card}>
      <h3 className={styles.name}>{team.teamName}</h3>

      <div className={styles.chips}>
        {team.categories.map((cat) => (
          <span
            key={cat}
            className={styles.chip}
            style={{ backgroundColor: genreColor(cat) }}
          >
            {cat}
          </span>
        ))}
      </div>

      <p className={styles.meta}>
        <span className={styles.metaLabel}>Team members:</span> {team.teamMembers}
      </p>
      <p className={styles.meta}>
        <span className={styles.metaLabel}>Table:</span> {team.teamNum}
      </p>

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setShowDescription((v) => !v)}
        aria-expanded={showDescription}
      >
        {showDescription ? "Hide description" : "Show description"}
      </button>

      {showDescription && (
        <p className={styles.description}>{team.description}</p>
      )}
    </article>
  );
}
