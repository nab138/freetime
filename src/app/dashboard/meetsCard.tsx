"use client";

import { MeetData, UserData } from "@/structures";
import styles from "./dashboard.module.css";
import Card from "@/components/Card";
import { Session } from "next-auth";
import { createMeet, joinMeet } from "./actions";
import { toast } from "sonner";
import ClientButton from "@/components/ClientButton";
import Link from "next/link";

export default function MeetsCard({
  data,
  session,
  meets,
}: {
  data: UserData;
  session: Session;
  meets: MeetData[];
}) {
  return (
    <Card className={styles.meets}>
      <h2>Meets</h2>
      {data.meets.length === 0 ? (
        <p>You have no meets. Create one to get started!</p>
      ) : (
        <ul>
          {meets.map((meet) => (
            <li key={meet.code}>
              <Link href={`/meet/${meet.code}`}>
                {meet.name + " - " + meet.code}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.accountButtons}>
        <input type="text" id="name" placeholder="Meet Name" required />
        <ClientButton
          onClick={async () => {
            "use client";
            let name = (document.getElementById("name") as HTMLInputElement)
              .value;
            if (name === "") {
              toast.warning("Meet name cannot be empty");
              return;
            }
            let result = await createMeet(
              session,
              (name ?? "Unamed Meet").toString()
            );
            if (result && result.error) {
              toast.error(result.error);
            } else {
              window.location.reload();
            }
          }}
        >
          Create Meet
        </ClientButton>
      </div>
      <p style={{ marginTop: "15px" }}>
        {data.meets.length === 0 ? "Or, i" : "I"}f you have an admin code:
      </p>
      <div className={styles.accountButtons}>
        <input type="text" id="admincode" placeholder="Admin Code" required />
        <ClientButton
          onClick={async () => {
            let adminCode = (
              document.getElementById("admincode") as HTMLInputElement
            ).value;
            let result = await joinMeet(session, (adminCode ?? "").toString());
            if (result && result.error) {
              toast.error(result.error);
            } else if (result && result?.warning) {
              toast.warning(result.warning);
            } else {
              window.location.reload();
            }
          }}
        >
          Add Meet
        </ClientButton>
      </div>
    </Card>
  );
}
