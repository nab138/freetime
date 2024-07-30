"use client";
import { Athlete } from "@/structures";
import styles from "./editor.module.css";
import { useState } from "react";
import ClientButton from "@/components/ClientButton";
import { toast } from "sonner";
import LinkButton from "@/components/LinkButton";
import save from "./actions";

export default function ResultsEditor({
  bibsRaw,
  timesRaw,
  roster,
  startTime,
  raceCode,
  meetCode,
}: {
  bibsRaw: number[];
  timesRaw: number[];
  roster: Athlete[];
  startTime: number;
  raceCode: string;
  meetCode: string;
}) {
  const [bibs, setBibs] = useState<number[] | null>(bibsRaw);
  const [times, setTimes] = useState<number[] | null>(timesRaw);
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        width: "100%",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {bibs !== null && times !== null && (
        <div className={styles.textarea}>
          <div
            className={styles.textareachild}
            style={{
              color: "rgb(var(--foreground-secondary-rgb))",
              minWidth: "50px",
            }}
          >
            <h3>Place</h3>
            {bibs.map((bib, i) => i).join("\n")}
          </div>
          <div
            contentEditable
            id="bibs"
            className={styles.textareachild}
            suppressContentEditableWarning={true}
            onInput={() => {
              let bibs = (
                document.getElementById("bibs") as HTMLDivElement
              ).innerText.split("\n");
              bibs.shift();
              setBibs(bibs.map((bib) => parseInt(bib)));
            }}
          >
            <h3
              contentEditable={false}
              style={{ color: "rgb(var(--foreground-rgb))" }}
            >
              Bibs
            </h3>
            {bibsRaw.join("\n")}
          </div>
          <div
            className={styles.textareachild}
            style={{
              color: "rgb(var(--foreground-secondary-rgb))",
            }}
          >
            <h3>Names</h3>
            {bibs
              .map((bib) => {
                let athlete = roster.find((athlete) => athlete.bib === bib);
                if (athlete === undefined) {
                  athlete = {
                    name: "Unknown Runner",
                    age: -1,
                    team: "Unknown Team",
                    bib,
                    gender: "?",
                  };
                }
                return athlete.name;
              })
              .join("\n")}
          </div>
          <div
            contentEditable
            id="times"
            className={styles.textareachild}
            suppressContentEditableWarning={true}
            onInput={() => {
              let times = (
                document.getElementById("times") as HTMLDivElement
              ).innerText.split("\n");
              times.shift();
              setTimes(times.map((time) => parseInt(time) + startTime));
            }}
          >
            <h3
              contentEditable={false}
              style={{
                color: "rgb(var(--foreground-rgb))",
                minWidth: "200px",
              }}
            >
              Times
            </h3>
            {timesRaw.map((t) => t - startTime).join("\n")}
          </div>
          <div
            className={styles.textareachild}
            style={{
              color: "rgb(var(--foreground-secondary-rgb))",
            }}
          >
            <h3>Timestamps</h3>
            {times
              .map((time) => formatTimeDifference(startTime, time, true))
              .join("\n")}
          </div>
        </div>
      )}
      <ClientButton
        onClick={async () => {
          if (bibs === null || times === null) return;
          // Find duplicate bibs and alert the user
          let bibSet = new Set<number>();
          let duplicateBibs = bibs.filter((bib) => {
            if (bibSet.has(bib)) return true;
            bibSet.add(bib);
            return false;
          });
          if (duplicateBibs.length > 0) {
            toast.error(
              `Duplicate bibs found: ${duplicateBibs
                .map((bib) => bib.toString())
                .join(", ")}`
            );
            return;
          }

          for (let bib of bibs) {
            if (!roster.find((athlete) => athlete.bib === bib)) {
              toast.error(`Bib ${bib} not found in roster`);
              return;
            }
          }

          await save(raceCode, bibs, times);

          toast.success("Results saved");
        }}
        style={{
          backgroundColor: "#38b649",
          color: "white",
        }}
      >
        Save
      </ClientButton>
      <LinkButton href={`/race/${meetCode}/${raceCode}`}>
        Back to race
      </LinkButton>
    </div>
  );
}

function formatTimeDifference(
  startTime: number,
  currentTime: number,
  subSeconds: boolean = false
): string {
  const timeDifference = currentTime - startTime;

  const totalSeconds = Math.floor(timeDifference / 1000);
  const milliseconds = timeDifference % 1000;

  // Extract hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format hours, minutes, and seconds to be two digits
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (subSeconds) {
    const formattedMilliseconds = String(
      Math.floor(milliseconds / 10)
    ).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  }

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
