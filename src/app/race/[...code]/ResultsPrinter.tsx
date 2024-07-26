"use client";

import ClientButton from "@/components/ClientButton";
import { MeetData, Race } from "@/structures";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import styles from "./results.module.css";

export default function ResultsPrinter({
  meet,
  race,
  bibs,
  times,
}: {
  meet: MeetData;
  race: Race;
  bibs: number[];
  times: number[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => contentRef.current });

  if (!isClient) {
    return null; // or a loading spinner
  }

  let data = bibs.map((bib, i) => {
    let athlete = meet.roster.find((athlete) => athlete.bib === bib);
    return {
      bib,
      ...athlete,
      time: times[i],
      place: i + 1,
    };
  });

  let topThree = data.slice(0, 3);
  let topThreeMale = data
    .filter((finisher) => finisher.gender === "M")
    .slice(0, 3);
  let topThreeFemale = data
    .filter((finisher) => finisher.gender === "F")
    .slice(0, 3);

  return (
    <div>
      <ClientButton onClick={handlePrint}>Print</ClientButton>
      <div style={{ display: "none" }}>
        <div className={styles.body} ref={contentRef}>
          <style>{getPageMargins()}</style>
          <div style={{ float: "left", fontSize: "12px", fontWeight: "600" }}>
            FreeTime - Flusche & Sharp Timing
          </div>
          <h4
            className={styles.h4}
            style={{ position: "absolute", width: "100%", textAlign: "center" }}
          >
            {meet.name}
          </h4>
          <div style={{ float: "right", fontSize: "12px", fontWeight: "600" }}>
            Ill put a date here later
          </div>
          <br style={{ lineHeight: "4px" }} />
          <div className={styles.header}>
            <h4 className={styles.h4}>
              Event #{meet.races.indexOf(race.code) + 1} {race.name} - Overall
              Results
            </h4>
          </div>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th style={{ width: "30px" }}></th>
                <th>Name</th>
                <th>Age</th>
                <th>Bib</th>
                <th>Avg per MI</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              <tr>
                <td colSpan={5}>
                  <h4 className={styles.sectionHeader}>Top 3 Overall:</h4>
                </td>
              </tr>
              {topThree.map((athlete, index) => (
                <tr key={index}>
                  <td>{athlete.place}</td>
                  <td>{athlete.name}</td>
                  <td>{athlete.age}</td>
                  <td>{athlete.bib}</td>
                  <td>Todo</td>
                  <td>
                    {formatTimeDifference(
                      new Date(race.startTime ?? -1),
                      new Date(athlete.time),
                      true
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5}>
                  <h4 className={styles.sectionHeader}>Top 3 Male:</h4>
                </td>
              </tr>
              {topThreeMale.map((athlete, index) => (
                <tr key={index}>
                  <td>{athlete.place}</td>
                  <td>{athlete.name}</td>
                  <td>{athlete.age}</td>
                  <td>{athlete.bib}</td>
                  <td>Todo</td>
                  <td>
                    {formatTimeDifference(
                      new Date(race.startTime ?? -1),
                      new Date(times[index]),
                      true
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5}>
                  <h4 className={styles.sectionHeader}>Top 3 Female:</h4>
                </td>
              </tr>

              {topThreeFemale.map((athlete, index) => (
                <tr key={index}>
                  <td>{athlete.place}</td>
                  <td>{athlete.name}</td>
                  <td>{athlete.age}</td>
                  <td>{athlete.bib}</td>
                  <td>Todo</td>
                  <td>
                    {formatTimeDifference(
                      new Date(race.startTime ?? -1),
                      new Date(times[index]),
                      true
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5}>
                  <h4 className={styles.sectionHeader}>All Participants:</h4>
                </td>
              </tr>

              {data.map((athlete, index) => (
                <tr key={index}>
                  <td>{athlete.place}</td>
                  <td>{athlete.name}</td>
                  <td>{athlete.age}</td>
                  <td>{athlete.bib}</td>
                  <td>Todo</td>
                  <td>
                    {formatTimeDifference(
                      new Date(race.startTime ?? -1),
                      new Date(times[index]),
                      true
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

const marginTop = "0.25in";
const marginRight = "0.25in";
const marginBottom = "0.25in";
const marginLeft = "0.25in";

const getPageMargins = () => {
  return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};
