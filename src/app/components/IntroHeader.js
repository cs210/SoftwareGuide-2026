import React from 'react';
import styles from './IntroHeader.module.css';

const IntroHeader = () => {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>
                <span className={styles.highlight}>2026</span>
                Software Fair
            </h1>
            <div className={styles.info}>
                <span className="font-semibold">When: </span>
                <span>Spring 2026 — schedule to be announced</span>
            </div>
            <div className={styles.info}>
                <span className="font-semibold">Where: </span>
                <a href="https://campus-map.stanford.edu/?id=08-300&lat=37.426108&lng=-122.17017&zoom=17" className={styles.link}>
                    CoDa B80 (Kuang Auditorium) &amp; outside patio
                </a>
            </div>
            <p className={`${styles.info} text-zinc-600 text-sm mt-2`}>
                Indoor tables 1–42 match the floor plan below (center 1–24, left wing 25–33, right wing 34–42). Patio tables will be added once assignments are finalized.
            </p>
            <div className={styles.info}>
                <span className="font-semibold">Parking Guide: </span>
                <a href="https://transportation.stanford.edu/parking-stanford/where-park/parking-stanford-campus" className={styles.link}>Map</a>
            </div>
        </header>
    );
};

export default IntroHeader;