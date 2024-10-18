"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResultsDocument from "./ResultsDocument";
import { MeetData, Race } from "@/structures";
import { AgeRange } from "./AgeRanges";
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

  let groups = calculateGroups(
    data,
    ageRanges,
    ageRanges === null ? "Overall" : "Age"
  );

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
              groups={groups.filter((g) => g.data.length > 0)}
              distance={distance}
            />
          }
          fileName={ageRanges === null ? "OverallResults" : "AgeGroupResults"}
        >
          {/* @ts-ignore */}
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

export type GroupsMode = "Overall" | "Age" | "Mixed";
export type FinisherData = {
  time: number;
  place: number;
  bib: number;
  name: string;
  age: number;
  gender: string;
  team: string;
};
export type Group = {
  name: string;
  data: FinisherData[];
};

export function calculateGroups(
  data: FinisherData[],
  ageRanges: AgeRange[] | null,
  mode: GroupsMode = "Overall"
): Group[] {
  let topThreeMale = data
    .filter((finisher) => finisher.gender === "M")
    .slice(0, 3);
  let topThreeFemale = data
    .filter((finisher) => finisher.gender === "F")
    .slice(0, 3);
  if (mode === "Overall") {
    let topThree = data.slice(0, 3);
    return [
      { name: "Top 3 Overall", data: topThree },
      { name: "Top 3 Male", data: topThreeMale },
      { name: "Top 3 Female", data: topThreeFemale },
      { name: "All Participants", data },
    ];
  } else if (ageRanges !== null) {
    let groups: { name: string; data: typeof data }[] = [];
    let ageRangeData = data.filter(
      (athlete) =>
        !topThreeMale.find((a) => a.bib === athlete.bib) &&
        !topThreeFemale.find((a) => a.bib === athlete.bib)
    );
    ageRanges.forEach((range) => {
      let rangeData = ageRangeData.filter(
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
    if (mode === "Mixed") {
      groups.unshift(
        { name: "Top 3 Male", data: topThreeMale },
        { name: "Top 3 Female", data: topThreeFemale }
      );
    }
    return groups;
  } else {
    throw new Error("Invalid group calculation mode");
  }
}
