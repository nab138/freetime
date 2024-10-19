"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResultsDocument from "./ResultsDocument";
import { MeetData, Race } from "@/structures";
import { AgeRange } from "./AgeRanges";
import LinkButton from "@/components/LinkButton";
import styles from "./results.module.css";
import { calculateGroups } from "./resultsutils";

const ResultsPrinter = ({
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
}) => {
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
};

export default ResultsPrinter;
