"use client";

import Card from "@/components/Card";
import ClientButton from "@/components/ClientButton";

import styles from "../race.module.css";
import { useEffect, useRef, useState } from "react";

import { getStartTime, getTimes, setRaceStartTime, setTimes } from "../actions";
import { toast } from "sonner";

export default function Timing({ raceCode }: { raceCode: string }) {
  const [loaded, setLoaded] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [finishers, setFinishers] = useState<number[]>([]);

  const finishersTable = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startTime && !loaded) {
      (async () => {
        const [startTime, finishers] = await Promise.all([
          getStartTime(raceCode),
          getTimes(raceCode),
        ]);
        if (startTime) {
          setStartTime(new Date(startTime));
        }
        setFinishers(finishers);
        setTimeout(() => {
          finishersTable.current?.scrollTo(
            0,
            finishersTable.current.scrollHeight
          );
        }, 1);
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
        <h2>Controls</h2>
        <p>
          Start Time:{" "}
          {startTime ? startTime.toLocaleTimeString("en-US") : "N/A"}
        </p>
        <p>
          Current Time:{" "}
          {startTime ? formatTimeDifference(startTime, currentTime) : "N/A"}
        </p>
        <p>End Time: N/A</p>
        <div className={styles.buttons} style={{ marginTop: "15px" }}>
          <ClientButton
            disabled={!loaded || startTime !== null}
            onClick={async () => {
              let startTime = new Date();
              // starttime is stored as a number
              let result = await setRaceStartTime(
                raceCode,
                startTime.getTime()
              );
              if (result && result.error) {
                toast.error(result.error);
                toast.info(
                  "If you missed the start of a race, screenshot this and input this timestamp: " +
                    startTime.getTime()
                );
              } else {
                setStartTime(startTime);
                toast.success("Race started! Good luck!");
              }
            }}
            style={{ color: "white", backgroundColor: "#38b649" }}
          >
            Start Race
          </ClientButton>
          <ClientButton
            disabled={!loaded || startTime === null}
            onClick={() => {
              alert(
                "We have the button, so we are better than XCMeet, but it doesn't do anything yet."
              );
            }}
            style={{ color: "white", backgroundColor: "var(--danger)" }}
          >
            Stop Race
          </ClientButton>
        </div>
      </Card>
      <Card>
        <h2>Finishers</h2>
        <div className={styles.buttons} style={{ marginTop: "15px" }}>
          <ClientButton
            disabled={!loaded || startTime === null}
            onClick={async () => {
              let finishTime = new Date();
              let currentTimes = await getTimes(raceCode);
              currentTimes.push(finishTime.getTime());
              await setTimes(raceCode, currentTimes);
              setFinishers(currentTimes);
              // Request animation frame to scroll to the bottom of the finishers table
              setTimeout(() => {
                finishersTable.current?.scrollTo(
                  0,
                  finishersTable.current.scrollHeight
                );
              }, 1);
            }}
            style={{
              padding: "30px",
              fontSize: "larger",
              width: "100%",
              color: "white",
              backgroundColor: "#38b649",
            }}
          >
            Mark Finisher
          </ClientButton>
        </div>
        {startTime && (
          <div className={styles.finishersTableContainer} ref={finishersTable}>
            <table className={styles.finishersTable}>
              <tbody>
                {finishers.map((time, index) => (
                  <tr key={index}>
                    <td>
                      <ClientButton
                        className={styles.deleteBtn}
                        onClick={() => {
                          let newFinishers = [...finishers];
                          newFinishers.splice(index, 1);
                          setFinishers(newFinishers);
                          setTimes(raceCode, newFinishers);
                        }}
                      >
                        🗑
                      </ClientButton>
                      {formatTimeDifference(startTime, new Date(time))}
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
