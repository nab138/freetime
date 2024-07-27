"use client";

import Card from "@/components/Card";
import styles from "./results.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBibs, getMeet, getRace, getTimes } from "./actions";
import { Athlete } from "@/structures";
import ClientButton from "@/components/ClientButton";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

export default function LiveResults({
  meetCode,
  raceCode,
  loggedIn,
}: {
  meetCode: string;
  raceCode: string;
  loggedIn: boolean;
}) {
  const [bibs, setBibs] = useState<number[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [roster, setRoster] = useState<Athlete[]>([]);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  const scrollUpTimeout = useRef<NodeJS.Timeout | null>(null);

  const handle = useFullScreenHandle();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const reportChange = useCallback(
    (state: boolean) => {
      if (state) {
        scrollInterval.current = setInterval(() => {
          if (tableContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
              tableContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight) {
              if (!scrollUpTimeout.current) {
                scrollUpTimeout.current = setTimeout(() => {
                  scrollUpTimeout.current = setInterval(() => {
                    tableContainerRef.current?.scrollBy({
                      top: -5,
                    });
                    if (tableContainerRef.current?.scrollTop === 0) {
                      clearInterval(scrollUpTimeout.current as NodeJS.Timeout);
                      scrollUpTimeout.current = null;
                    }
                  }, 1);
                }, 2500);
              }
            } else if (!scrollUpTimeout.current) {
              tableContainerRef.current.scrollBy({
                top: 1,
              });
            }
          }
        }, 25);
      } else if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    },
    [handle]
  );

  useEffect(() => {
    let update = async () => {
      let [newBibs, newTimes, newRace, newMeet] = await Promise.all([
        getBibs(raceCode),
        getTimes(raceCode),
        getRace(raceCode),
        getMeet(meetCode),
      ]);
      setBibs(newBibs);
      setTimes(newTimes);
      setStartTime(newRace?.startTime);
      if (newMeet?.roster !== undefined && roster !== newMeet?.roster)
        setRoster(newMeet?.roster ?? []);
    };
    update();
    setInterval(update, loggedIn ? 30 * 1000 : 5 * 60 * 1000);
  }, []);
  return (
    <Card style={{ flexGrow: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h2 style={{ marginBottom: 0 }}>
          Live Results -{" "}
          <span style={{ color: "var(--danger)" }}>Results are NOT final!</span>
        </h2>
        <ClientButton
          onClick={() => {
            handle.enter();
          }}
          style={{ padding: "8px", margin: 0 }}
        >
          Maximize
        </ClientButton>
      </div>
      {(startTime === undefined || startTime === null) && (
        <p>This race has not started yet.</p>
      )}
      {startTime !== undefined && startTime !== null && (
        <FullScreen handle={handle} onChange={reportChange}>
          <div
            className={
              handle.active
                ? styles.fullScreenResultsContainer +
                  " " +
                  styles.resultsTableContainer
                : styles.resultsTableContainer
            }
            ref={tableContainerRef}
          >
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Bib</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bibs.map((bib, index) => {
                  let athlete = roster.find((a) => a.bib === bib);
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{athlete?.name ?? "Unkown Runner"}</td>
                      <td>{athlete?.gender ?? "?"}</td>
                      <td>{athlete?.age ?? "?"}</td>
                      <td>{bib}</td>
                      <td>
                        {times.length <= index &&
                        startTime !== undefined &&
                        startTime !== null
                          ? "N/A"
                          : formatTimeDifference(
                              new Date(startTime as number),
                              new Date(times[index]),
                              true
                            )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FullScreen>
      )}
    </Card>
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
