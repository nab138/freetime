import styles from "./meet.module.css";

import { auth } from "@/auth";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { MeetData, Race, UserData } from "@/structures";
import { kv } from "@vercel/kv";
import { redirect } from "next/navigation";
import RosterTable from "./RosterTable";
import DeleteButton from "./DeleteButton";
import RaceList from "./RaceList";
import LinkButton from "@/components/LinkButton";

export default async function Meet({ params }: { params: { code: string } }) {
  let session = await auth();
  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  let data = await kv.get<UserData>(session.user.email);
  if (!data) {
    data = { email: session.user.email, meets: [] };
    await kv.set(session.user.email, data);
  }
  let meet: MeetData | null = null;
  if (data.meets.includes(params.code)) {
    meet = await kv.get<MeetData>(params.code);
  }

  if (!meet) {
    return (
      <main>
        <h1>Unkown meet</h1>
        <p>Meet not found, or you do not have access!</p>
        <LinkButton href="/dashboard">Return to dashboard</LinkButton>
      </main>
    );
  }

  let races: Race[] = [];
  for (let race of meet.races) {
    let raceData = await kv.get<Race>("race-" + race);
    if (raceData) races.push(raceData);
  }
  return (
    <main>
      <div className={"header"}>
        <h1>{meet.name}</h1>
        <LinkButton href="/dashboard">Return to dashboard</LinkButton>
      </div>
      <div className={"content"}>
        <Card>
          <h2>Meet Info</h2>
          <p>
            <strong>Name:</strong> {meet.name}
          </p>
          <p>
            <strong>Meet Code:</strong> {meet.code}
          </p>
          <p style={{ marginBottom: "10px" }}>
            <strong>Admin Code:</strong> {meet.adminCode}
          </p>
          <DeleteButton meet={meet} />
        </Card>
        <Card className={styles.roster}>
          <h2>Roster</h2>
          {meet.roster.length === 0 && <p>No one has joined this meet yet!</p>}
          <RosterTable meet={meet} />
        </Card>
        <Card>
          <h2>Races</h2>
          {meet.races.length === 0 && (
            <p>There are no races in this meet yet!</p>
          )}
          <RaceList races={races} meet={meet} />
        </Card>
      </div>
    </main>
  );
}
