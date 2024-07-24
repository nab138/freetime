import Button from "@/components/Button";
import styles from "./dashboard.module.css";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { kv } from "@vercel/kv";
import { MeetData, UserData } from "@/structures";
import Card from "@/components/Card";
import { createMeet, joinMeet } from "./actions";
import { FormEvent } from "react";
import MeetsCard from "./meetsCard";

export default async function Home() {
  let session = await auth();
  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  let data = await kv.get<UserData>(session.user.email);
  let validMeetCodes = data?.meets ?? [];
  let meets: MeetData[] = [];
  if (!data) {
    data = { email: session.user.email, meets: [] };
    await kv.set(session.user.email, data);
  }
  for (let code of data.meets) {
    let meet = await kv.get<MeetData>(code);
    if (meet) {
      meets.push(meet);
    } else {
      validMeetCodes = validMeetCodes.filter((c) => c !== code);
    }
  }
  if (validMeetCodes.length !== data.meets.length) {
    data.meets = validMeetCodes;
    await kv.set(session.user.email, data);
  }

  return (
    <main>
      <h1>FreeTime Dashboard</h1>
      <div className={styles.content}>
        <Card className={styles.account}>
          <h2>Account</h2>
          <div className={styles.accountDetails}>
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User Image"}
                width={64}
                height={64}
                style={{ borderRadius: "5px" }}
              />
            )}
            <div>
              <p>Logged in as {session?.user?.name}</p>
              <p
                style={{
                  color: "rgb(var(--foreground-secondary-rgb))",
                }}
              >
                {session?.user?.email}
              </p>
            </div>
          </div>
          <form
            className={styles.accountButtons}
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button type="submit">Sign Out</Button>
          </form>
        </Card>
        <MeetsCard session={session} data={data} meets={meets} />
      </div>
    </main>
  );
}
