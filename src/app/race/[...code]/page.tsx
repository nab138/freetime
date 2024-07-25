import Card from "@/components/Card";
import { MeetData, Race } from "@/structures";
import { kv } from "@vercel/kv";

import styles from "./race.module.css";
import { redirect } from "next/navigation";
import Button from "@/components/Button";
import RaceDeleteButton from "./RaceDeleteButton";
import ClientButton from "@/components/ClientButton";
import LinkButton from "@/components/LinkButton";

export default async function RacePage({
  params,
}: {
  params: {
    code: string[];
  };
}) {
  if (params.code.length !== 2 && params.code.length !== 3) {
    return (
      <main>
        <h1>Invalid URL.</h1>
      </main>
    );
  }
  let meetCode = params.code[0];
  let raceCode = params.code[1];
  let meet = await kv.get<MeetData>(meetCode);
  if (!meet) {
    return (
      <main>
        <h1>Failed to retrieve meet data.</h1>
      </main>
    );
  }
  if (!meet.races.includes(raceCode)) {
    return (
      <main>
        <h1>Race not found in meet.</h1>
      </main>
    );
  }
  let race = await kv.get<Race>("race-" + raceCode);
  if (!race) {
    return (
      <main>
        <h1>Failed to retrieve race data.</h1>
      </main>
    );
  }
  if (params.code.length === 3) {
    if (params.code[2] === "timer") {
      return (
        <main>
          <div className={"header"}>
            <h1>{race.name} - Timing</h1>
            <h3>{meet.name}</h3>
            <LinkButton href={`/race/${meetCode}/${raceCode}`}>
              Back to race
            </LinkButton>
          </div>
        </main>
      );
    } else if (params.code[2] === "bibs") {
      return (
        <main>
          <div className={"header"}>
            <h1>{race.name} - Bibs</h1>
            <h3>{meet.name}</h3>
            <LinkButton href={`/race/${meetCode}/${raceCode}`}>
              Back to race
            </LinkButton>
          </div>
        </main>
      );
    } else {
      return (
        <main>
          <h1>Invalid URL.</h1>
        </main>
      );
    }
  }
  return (
    <main>
      <div className={"header"}>
        <h1>{race.name}</h1>
        <LinkButton href={`/meet/${meetCode}`}>Return to meet</LinkButton>
      </div>
      <div className={"content"}>
        <Card>
          <h2>Race Info</h2>
          <p>
            <strong>Name:</strong> {race.name}
          </p>
          <p>
            <strong>Meet:</strong> {meet.name}
          </p>
          <p style={{ marginBottom: "10px" }}>
            <strong>Race Code:</strong> {race.code}
          </p>
          <RaceDeleteButton meet={meet} raceCode={race.code} />
        </Card>
        <Card>
          <h2>Timing</h2>
          <div className={styles.buttons}>
            <LinkButton href={`/race/${meetCode}/${raceCode}/timer`}>
              I'm a timer
            </LinkButton>
            <LinkButton href={`/race/${meetCode}/${raceCode}/bibs`}>
              I'm a bib reader
            </LinkButton>
          </div>
        </Card>
        <Card>
          <h2>Results</h2>
          <p>Coming Soon</p>
        </Card>
      </div>
    </main>
  );
}
