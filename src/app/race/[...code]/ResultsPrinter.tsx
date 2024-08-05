"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResultsDocument from "./ResultsDocument";
import { MeetData, Race } from "@/structures";
import { AgeRange } from "./AgeRanges";
import ClientButton from "@/components/ClientButton";
import LinkButton from "@/components/LinkButton";
import styles from "./results.module.css";

export default function ResultsPrinter({
  meet,
  race,
  bibs,
  times,
  distance,
  ageRanges = null,
}: {
  meet: MeetData;
  race: Race;
  bibs: number[];
  times: number[];
  distance: number;
  ageRanges?: AgeRange[] | null;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      <div className={styles.buttonContainer}>
        <PDFDownloadLink
          className={styles.button}
          document={
            <ResultsDocument
              resultsName={ageRanges === null ? "Overall" : "Age Group"}
              meet={meet}
              race={race}
              groups={groups}
              distance={distance}
            />
          }
          fileName={ageRanges === null ? "OverallResults" : "AgeGroupResults"}
        >
          {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
        </PDFDownloadLink>
        {ageRanges === null && (
          <LinkButton href={`/results/${meet.code}/${race.code}`}>
            View Live
          </LinkButton>
        )}
        {ageRanges === null && (
          <LinkButton href={`/editor/${meet.code}/${race.code}`}>
            Edit Results
          </LinkButton>
        )}
      </div>
    </div>
  );
}
