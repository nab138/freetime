import Card from "@/components/Card";
import { MeetData, Race } from "@/structures";
import { kv } from "@vercel/kv";

import styles from "./race.module.css";
import { redirect } from "next/navigation";
import Button from "@/components/Button";
import RaceDeleteButton from "./RaceDeleteButton";

export default async function RacePage({
  params,
}: {
  params: {
    code: string[];
  };
}) {
  if (params.code.length !== 2) {
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
  return (
    <main>
      <div className={"header"}>
        <h1>{race.name}</h1>
        <form
          action={async () => {
            "use server";
            redirect("/meet/" + meetCode);
          }}
        >
          <Button type="submit">Back to meet</Button>
        </form>
      </div>
      <div className={"content"}>
        <Card>
          <h2>Race Info</h2>
          <p>
            <strong>Name:</strong> {race.name}
          </p>
          <p style={{ marginBottom: "10px" }}>
            <strong>Race Code:</strong> {race.code}
          </p>
          <RaceDeleteButton meet={meet} raceCode={race.code} />
        </Card>
      </div>
    </main>
  );
}
