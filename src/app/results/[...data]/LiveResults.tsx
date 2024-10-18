"use client";

import Card from "@/components/Card";
import styles from "./results.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBibs, getMeet, getRace, getTimes } from "./actions";
import { Athlete } from "@/structures";
import ClientButton from "@/components/ClientButton";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { calculateGroups, Group } from "@/app/race/[...code]/ResultsPrinter";
import { AgeRange } from "@/app/race/[...code]/AgeRanges";
import { getAgeRanges } from "@/app/race/[...code]/actions";

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

  const [ageRanges, setAgeRangesState] = useState<AgeRange[] | null>(null);
  const [groupData, setGroupData] = useState<Group[] | null>(null);

  useEffect(() => {
    (async () => {
      const ranges = await getAgeRanges(raceCode);
      setAgeRangesState(ranges);
    })();
  }, []);

  useEffect(() => {
    if (
      ageRanges === null ||
      ageRanges === undefined ||
      bibs === undefined ||
      times === undefined ||
      roster === undefined ||
      startTime === undefined
    )
      return;
    let data = bibs.map((bib, i) => {
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
      return {
        ...athlete,
        time: times[i],
        place: i + 1,
      };
    });
    let groups = calculateGroups(data, ageRanges, "Mixed");
    setGroupData(groups);
  }, [ageRanges, bibs, times, roster, startTime]);

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
                      setTimeout(() => {
                        scrollUpTimeout.current = null;
                      }, 2500);
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
            <ResultsTable
              isFullscreen={handle.active}
              bibs={bibs}
              times={times}
              startTime={startTime}
              roster={roster}
            />
            <ResultsTable
              isFullscreen={handle.active}
              bibs={bibs}
              times={times}
              startTime={startTime}
              roster={roster}
              groups={groupData}
            />
          </div>
        </FullScreen>
      )}
    </Card>
  );
}

function ResultsTable({
  isFullscreen,
  bibs,
  roster,
  times,
  startTime,
  groups = null,
}: {
  isFullscreen: boolean;
  bibs: number[];
  times: number[];
  startTime: number | null;
  roster: Athlete[];
  groups?: Group[] | null;
}) {
  const generateAthleteRow = useCallback(
    (bib: number, index: number) => {
      let athlete = roster.find((a) => a.bib === bib);
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{athlete?.name ?? "Unkown Runner"}</td>
          {groups === null && <td>{athlete?.gender ?? "?"}</td>}
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
    },
    [roster, times, startTime]
  );
  return (
    <table className={styles.resultsTable}>
      <thead>
        {isFullscreen && (
          <tr
            style={{
              borderBottom: "2px solid rgb(var(--card-border-rgb))",
            }}
          >
            <th colSpan={6}>
              <h3
                style={{
                  color: "var(--danger)",
                  fontWeight: "bold",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                Results are NOT final! If you see an error, report it to a race
                official immediately.
              </h3>
            </th>
          </tr>
        )}
        <tr
          style={{
            borderBottom: "2px solid rgb(var(--card-border-rgb))",
          }}
        >
          <th colSpan={6}>
            <p
              style={{
                fontWeight: "bold",
              }}
            >
              {groups !== null ? "Age Group Results" : "Overall Results"}
            </p>
          </th>
        </tr>
        <tr>
          <th>Place</th>
          <th>Name</th>
          {groups === null && <th>Gender</th>}
          <th>Age</th>
          <th>Bib</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {groups === null && bibs.map(generateAthleteRow)}
        {groups !== null &&
          groups.map((group) => {
            return (
              <>
                <tr>
                  <td colSpan={6}>
                    <h4>{group.name}</h4>
                  </td>
                </tr>
                {group.data.map((d) => generateAthleteRow(d.bib, d.place - 1))}
              </>
            );
          })}
      </tbody>
    </table>
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
