"use client";

import { getAllLegendFields } from "@/data/sectionFields";
import styles from "./MapLegend.module.css";

export default function MapLegend({ activeFilter, onFilterChange }) {
  const fields = getAllLegendFields();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.title}>Filter by genre</p>
        {activeFilter && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onFilterChange(null)}
          >
            Show all
          </button>
        )}
      </div>
      <div className={styles.grid}>
        {fields.map((field) => {
          const active = activeFilter === field.label;
          return (
            <button
              key={field.label}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ""}`}
              style={{
                "--chip-color": field.color,
                borderColor: active ? field.color : undefined,
              }}
              onClick={() =>
                onFilterChange(active ? null : field.label)
              }
              aria-pressed={active}
            >
              <span
                className={styles.swatch}
                style={{ backgroundColor: field.color }}
                aria-hidden
              />
              {field.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
