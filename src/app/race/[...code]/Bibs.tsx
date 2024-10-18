"use client";

import Card from "@/components/Card";
import ClientButton from "@/components/ClientButton";

import styles from "./race.module.css";
import { useEffect, useRef, useState } from "react";

import { getBibs, getStartTime, setServerBibs } from "./actions";
import { Athlete } from "@/structures";
import Button from "@/components/Button";
import useSound from "use-sound";

export default function Bibs({
  raceCode,
  roster,
}: {
  raceCode: string;
  roster: Athlete[];
}) {
  const [loaded, setLoaded] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bibs, setBibs] = useState<number[]>([]);
  const [play] = useSound("/beep.mp3");

  const table = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startTime && !loaded) {
      (async () => {
        const [startTime, bibs] = await Promise.all([
          getStartTime(raceCode),
          getBibs(raceCode),
        ]);
        if (startTime) {
          setStartTime(new Date(startTime));
        }
        setBibs(bibs);
        setLoaded(true);
        setTimeout(() => {
          table.current?.scrollTo(0, table.current.scrollHeight);
        }, 1);
      })();
    }

    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="content">
      <Card>
        <h2>Info</h2>
        <p>
          Start Time:{" "}
          {startTime ? startTime.toLocaleTimeString("en-US") : "N/A"}
        </p>
        <p>
          Current Time:{" "}
          {startTime ? formatTimeDifference(startTime, currentTime) : "N/A"}
        </p>
        <p>End Time: N/A</p>
      </Card>
      <Card>
        <h2>Finishers (bibs)</h2>
        <form
          className={styles.buttons}
          style={{ marginTop: "15px" }}
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            let bibRaw = document.getElementById(
              "bibnumber"
            ) as HTMLInputElement;
            let bib = parseInt(bibRaw.value);
            let currentBibs = await getBibs(raceCode);
            if (currentBibs.includes(bib)) {
              alert("Bib already marked as finished.");
              return;
            }
            if (!roster.find((a) => a.bib === bib)) {
              let nameLookup = roster.find((a) => a.name === bibRaw.value);
              if (nameLookup) {
                bib = nameLookup.bib;
              } else {
                let firstNameLookup = roster.find(
                  (a) => a.name.split(" ")[0] === bibRaw.value
                );
                if (firstNameLookup) {
                  bib = firstNameLookup.bib;
                } else {
                  alert("Bib not found in roster.");
                  return;
                }
              }
            }

            bibRaw.value = "";
            currentBibs.push(bib);
            await setServerBibs(raceCode, currentBibs);
            setBibs(currentBibs);
            play();
            bibRaw.focus();
            setTimeout(() => {
              table.current?.scrollTo(0, table.current.scrollHeight);
            }, 1);
          }}
        >
          <input id="bibnumber" placeholder="Bib Number" required />
          <Button
            type="submit"
            disabled={!loaded && startTime === null}
            style={{
              flexGrow: 1,
              color: "white",
              backgroundColor: "#38b649",
            }}
          >
            Mark Finisher
          </Button>
        </form>
        {startTime && (
          <div className={styles.finishersTableContainer} ref={table}>
            <table className={styles.finishersTable}>
              <tbody>
                {bibs.map((bib, index) => (
                  <tr key={index}>
                    <td>
                      <ClientButton
                        className={styles.deleteBtn}
                        onClick={() => {
                          let newBibs = [...bibs];
                          newBibs.splice(index, 1);
                          setBibs(newBibs);
                          setServerBibs(raceCode, newBibs);
                        }}
                      >
                        🗑
                      </ClientButton>
                      {roster.find((r) => r.bib === bib)?.name} - #{bib}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function formatTimeDifference(
  startTime: Date,
  currentTime: Date,
  subSeconds: boolean = false
): string {
  const timeDifference = currentTime.getTime() - startTime.getTime();

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
