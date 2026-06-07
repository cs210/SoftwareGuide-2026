import styles from "./IntroHeader.module.css";

const IntroHeader = () => {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>Stanford CS 210</p>
      <h1 className={styles.title}>
        <span className={styles.highlight}>2026</span>
        Software Fair
      </h1>
      <p className={styles.lede}>
        Join <strong>40+ teams</strong> from CS210, CS194, and CS191 demoing software across genres, from
        education and health to games, research, and more. Use the interactive
        map below to explore CoDa B80 and find projects by field.
      </p>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>When</span>
          <span className={styles.value}>
            Wednesday, June 10, 2026 · 3:30–6:30 PM
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Where</span>
          <a
            href="https://campus-map.stanford.edu/?id=07-430&lat=37.42985851734201&lng=-122.17117633253574&zoom=17&srch=undefined"
            className={styles.link}
          >
            CoDa B80 (Kuang Auditorium) &amp; outside patio
          </a>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Parking</span>
          <a
            href="https://transportation.stanford.edu/parking-stanford/where-park/parking-stanford-campus"
            className={styles.link}
          >
            Campus parking guide
          </a>
        </div>
      </div>
    </header>
  );
};

export default IntroHeader;
