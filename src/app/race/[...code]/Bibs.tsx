"use client";

import Card from "@/components/Card";
import ClientButton from "@/components/ClientButton";

import styles from "./race.module.css";
import { useEffect, useState } from "react";

import { getBibs, getStartTime, setServerBibs, setTimes } from "./actions";
import { toast } from "sonner";

export default function Bibs({ raceCode }: { raceCode: string }) {
  const [loaded, setLoaded] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bibs, setBibs] = useState<number[]>([]);

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
        <div className={styles.buttons} style={{ marginTop: "15px" }}>
          <input
            type="number"
            id="bibnumber"
            placeholder="Bib Number"
            required
          />
          <ClientButton
            disabled={!loaded && startTime === null}
            onClick={async () => {
              let bibRaw = document.getElementById(
                "bibnumber"
              ) as HTMLInputElement;
              let bib = parseInt(bibRaw.value);
              if (isNaN(bib)) {
                toast.error("Please enter a valid bib number.");
                return;
              }
              let currentBibs = await getBibs(raceCode);
              currentBibs.push(bib);
              await setServerBibs(raceCode, currentBibs);
              setBibs(currentBibs);
            }}
            style={{
              flexGrow: 1,
              color: "white",
              backgroundColor: "#38b649",
            }}
          >
            Mark Finisher
          </ClientButton>
        </div>
        {startTime && (
          <div className={styles.finishersTableContainer}>
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
                      {bib}
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
