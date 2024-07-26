import styles from "./meet.module.css";

import { auth } from "@/auth";
import Card from "@/components/Card";
import { MeetData, Race, UserData } from "@/structures";

import { redirect } from "next/navigation";
import RosterTable from "./RosterTable";
import DeleteButton from "./DeleteButton";
import RaceList from "./RaceList";
import LinkButton from "@/components/LinkButton";
import { getKv } from "@/kv";
import Button from "@/components/Button";

export default async function Meet({ params }: { params: { code: string } }) {
  let session = await auth();
  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  const kv = await getKv();
  let data = (await kv.get<UserData>(["users", session.user.email])).value;
  if (!data) {
    data = { email: session.user.email, meets: [] };
    await kv.set(["users", session.user.email], data);
  }
  let meet: MeetData | null = null;
  if (data.meets.includes(params.code)) {
    meet = (await kv.get<MeetData>(["meets", params.code])).value;
  }
  let activeMeets: string[] | null = (await kv.get<string[]>(["activeMeets"]))
    .value;
  if (!activeMeets) {
    activeMeets = [];
    await kv.set(["activeMeets"], activeMeets);
  }
  let isActive = activeMeets.includes(params.code);

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
    const kv = await getKv();
    let raceData = (await kv.get<Race>(["race", race])).value;
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
          <p>
            <strong>Active: </strong> {isActive ? "Yes" : "No"}
          </p>
          <p style={{ marginBottom: "10px" }}>
            <strong>Admin Code:</strong> {meet.adminCode}
          </p>
          <form
            action={async () => {
              "use server";
              const db = await getKv();
              let actives: string[] =
                (await db.get<string[]>(["activeMeets"])).value ?? [];
              if (isActive) {
                actives = actives.filter((m) => m !== meet.code);
                await db.set(["activeMeets"], actives);
              } else {
                actives.push(meet.code);
                await db.set(["activeMeets"], actives);
              }
              redirect(`/meet/${meet.code}`);
            }}
            style={{ display: "flex", gap: "10px" }}
          >
            <Button type="submit">
              {isActive ? "Deactivate" : "Activate"}
            </Button>
            <DeleteButton meet={meet} />
          </form>
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
