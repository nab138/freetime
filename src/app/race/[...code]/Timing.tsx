"use client";

import Card from "@/components/Card";
import ClientButton from "@/components/ClientButton";

import styles from "./race.module.css";
import { useEffect, useState } from "react";

import { Race } from "@/structures";

export default function Timing({ raceCode }: { raceCode: string }) {
  let [hasCheckedForStart, setHasCheckedForStart] = useState(false);
  let [startTime, setStartTime] = useState<Date | null>(null);
  let [race, setRace] = useState<Race | null>(null);

  //   useEffect(() => {
  //     if (!startTime && !hasCheckedForStart) {
  //       (async () => {
  //         let startTime = (await kv.get<Race>(raceCode))?.startTime;
  //         if (startTime) {
  //           setStartTime(new Date(startTime));
  //         }

  //         setHasCheckedForStart(true);
  //       })();
  //     }
  //   }, []);

  return (
    <div className="content">
      <Card>
        <h2>Controls</h2>
        <p>Start Time: {startTime ? startTime.toISOString() : "N/A"}</p>
        <p>End Time: N/A</p>
        <div className={styles.buttons} style={{ marginTop: "15px" }}>
          <ClientButton
            onClick={() => {}}
            style={{ color: "white", backgroundColor: "#38b649" }}
          >
            Start Race
          </ClientButton>
          <ClientButton
            onClick={() =>
              alert("Why would you stop a race you haven't started?")
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
