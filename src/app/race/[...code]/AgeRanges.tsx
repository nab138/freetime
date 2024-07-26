"use client";

import ClientButton from "@/components/ClientButton";
import styles from "./race.module.css";
import { useEffect, useState } from "react";
import ResultsPrinter from "./ResultsPrinter";
import { MeetData, Race } from "@/structures";
import { getAgeRanges, setAgeRanges } from "./actions";

export default function AgeRanges({
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
  const [ageRanges, setAgeRangesState] = useState<AgeRange[] | null>(null);

  useEffect(() => {
    (async () => {
      const ranges = await getAgeRanges(race.code);
      setAgeRangesState(ranges);
    })();
  }, []);

  useEffect(() => {
    if (ageRanges !== null) setAgeRanges(race.code, ageRanges);
  }, [ageRanges]);

  if (ageRanges === null) return null;
  return (
    <div className={styles.ageRangeInputs}>
      <ul>
        {ageRanges.map((a, i) => (
          <li className={styles.ageRange} key={i}>
            <div className={styles.ageRangeStart}>
              <input
                type="number"
                className={styles.ageRangeInput}
                value={a[0].toString()}
                onChange={(e) => {
                  const newAgeRanges = [...ageRanges];
                  newAgeRanges[i][0] = parseInt(e.target.value);
                  setAgeRangesState(newAgeRanges);
                }}
              />
            </div>
            <span className={styles.toText}> to </span>
            <div className={styles.ageRangeEnd}>
              <input
                type="number"
                className={styles.ageRangeInput}
                value={a[1].toString()}
                onChange={(e) => {
                  const newAgeRanges = [...ageRanges];
                  newAgeRanges[i][1] = parseInt(e.target.value);
                  setAgeRangesState(newAgeRanges);
                }}
              />
            </div>
            <div>
              <ClientButton
                className={styles.deleteBtn}
                onClick={() => {
                  setAgeRangesState(ageRanges.filter((_, j) => j !== i));
                }}
              >
                🗑️
              </ClientButton>
            </div>
          </li>
        ))}
      </ul>
      <ClientButton
        className={styles.addAgeRange}
        onClick={() => {
          setAgeRangesState([...ageRanges, [0, 100]]);
        }}
        style={{ marginBottom: "10px" }}
      >
        Add range
      </ClientButton>
      <ResultsPrinter
        ageRanges={ageRanges}
        meet={meet}
        race={race}
        bibs={bibs}
        times={times}
      />
    </div>
  );
}

export type AgeRange = [number, number];
