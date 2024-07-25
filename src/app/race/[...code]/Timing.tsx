"use client";

import Card from "@/components/Card";
import ClientButton from "@/components/ClientButton";

import styles from "./race.module.css";

export default function Timing({}) {
  return (
    <div className="content">
      <Card>
        <h2>Controls</h2>
        <div className={styles.buttons}>
          <ClientButton
            onClick={() => alert("Nothing here yet!")}
            style={{ color: "white", backgroundColor: "#38b649" }}
          >
            Start Race
          </ClientButton>
          <ClientButton
            onClick={() =>
              alert("Why would you start a race you haven't started, dunce?")
            }
            style={{ color: "white", backgroundColor: "var(--danger)" }}
          >
            Stop Race
          </ClientButton>
        </div>
      </Card>
    </div>
  );
}
