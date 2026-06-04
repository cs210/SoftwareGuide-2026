"use client";

import FairGuide from "./components/FairGuide";
import IntroHeader from "./components/IntroHeader";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <IntroHeader />
        <FairGuide />
      </div>
    </main>
  );
}
