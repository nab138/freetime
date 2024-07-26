"use client";

import ClientButton from "@/components/ClientButton";
import { MeetData, Race } from "@/structures";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import styles from "./results.module.css";
import { AgeRange } from "./AgeRanges";

export default function ResultsPrinter({
  meet,
  race,
  bibs,
  times,
  ageRanges = null,
}: {
  meet: MeetData;
  race: Race;
  bibs: number[];
  times: number[];
  ageRanges?: AgeRange[] | null;
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

  let groups: { name: string; data: typeof data }[] = [];
  if (ageRanges === null) {
    let topThree = data.slice(0, 3);
    let topThreeMale = data
      .filter((finisher) => finisher.gender === "M")
      .slice(0, 3);
    let topThreeFemale = data
      .filter((finisher) => finisher.gender === "F")
      .slice(0, 3);
    groups = [
      { name: "Top 3 Overall", data: topThree },
      { name: "Top 3 Male", data: topThreeMale },
      { name: "Top 3 Female", data: topThreeFemale },
      { name: "All Participants", data },
    ];
  } else {
    ageRanges.forEach((range) => {
      let rangeData = data.filter(
        (athlete) => athlete.age >= range[0] && athlete.age <= range[1]
      );
      if (rangeData.length === 0) return;
      let male = rangeData.filter((athlete) => athlete.gender === "M");
      if (male.length > 0) {
        groups.push({
          name: `Male ${range[0]} - ${range[1]}`,
          data: male,
        });
      }
      let female = rangeData.filter((athlete) => athlete.gender === "F");
      if (female.length > 0) {
        groups.push({
          name: `Female ${range[0]} - ${range[1]}`,
          data: female,
        });
      }
    });
  }

  return (
    <div>
      <ClientButton onClick={handlePrint}>
        Print {ageRanges === null ? "Overall" : "Age Ranges"}
      </ClientButton>
      <div style={{ display: "none" }}>
        <div className={styles.body} ref={contentRef}>
          <style>{getPageMargins()}</style>
          <div
            style={{
              float: "left",
              fontSize: "16px",
              fontWeight: "600",
              textAlign: "left",
            }}
          >
            FreeTime
            <br />
            <span style={{ fontSize: "14px", color: "rgb(61, 61, 61)" }}>
              by Flusche & Sharp Timing
            </span>
          </div>
          <h4
            className={styles.h4}
            style={{
              position: "absolute",
              width: "100%",
              textAlign: "center",
              fontSize: "32px",
            }}
          >
            {meet.name}
          </h4>
          <div
            style={{
              float: "right",
              fontSize: "16px",
              fontWeight: "600",
              textAlign: "right",
            }}
          >
            {new Date().toLocaleDateString("en-US")}
            <br />
            <span style={{ fontSize: "14px", color: "rgb(61, 61, 61)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            </span>
          </div>
          <br />
          <div className={styles.header}>
            <h4 className={styles.h4}>
              Event #{meet.races.indexOf(race.code) + 1} {race.name} -{" "}
              {ageRanges === null ? "Overall" : "Age"} Results
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
              {groups.map((group, groupIndex) => (
                <>
                  <tr>
                    <td colSpan={5}>
                      <h4 className={styles.sectionHeader}>{group.name}</h4>
                    </td>
                  </tr>
                  {group.data.map((athlete, index) => (
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
                </>
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
