import styles from "./meet.module.css";

import { auth } from "@/auth";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { MeetData, UserData } from "@/structures";
import { kv } from "@vercel/kv";
import { redirect } from "next/navigation";
import RosterTable from "./RosterTable";
import DeleteButton from "./DeleteButton";

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
        <form
          action={async () => {
            "use server";
            redirect("/dashboard");
          }}
        >
          <Button type="submit">Return to dashboard</Button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.header}>
        <h1>{meet.name}</h1>
        <form
          action={async () => {
            "use server";
            redirect("/dashboard");
          }}
        >
          <Button type="submit">Back to dashboard</Button>
        </form>
      </div>
      <div className={styles.content}>
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
          <p>uhhhh</p>
        </Card>
      </div>
    </main>
  );
}
