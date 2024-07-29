import Image from "next/image";
import styles from "./page.module.css";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getKv } from "@/kv";
import { MeetData } from "@/structures";
import Link from "next/link";
import Card from "@/components/Card";
import LinkButton from "@/components/LinkButton";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  const kv = await getKv();
  let activeMeetCodes = (await kv.get<string[]>(["activeMeets"])).value ?? [];
  let activeMeetNames = activeMeetCodes.map(async (code) => {
    const meet = await kv.get<MeetData>(["meets", code]);
    return meet.value?.name;
  });

  return (
    <main>
      <div className={styles.header}>
        <Image
          src="/logo.png"
          alt="FreeTime Logo"
          width={576 / 4}
          height={672 / 4}
        />
        <div>
          <h1>FreeTime</h1>
          <h2>A Flusche & Sharp project</h2>
        </div>
      </div>
      <Card>
        <h3>Live Results</h3>
        {activeMeetCodes.length > 0 ? (
          <ul style={{ listStyle: "none", textDecoration: "underline" }}>
            {activeMeetNames.map((name, i) => {
              return (
                <li key={activeMeetCodes[i]}>
                  <Link href={"/results/" + activeMeetCodes[i]}>{name}</Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No active meets today.</p>
        )}
      </Card>
      <p>Freetime is currently in closed beta.</p>
      <LinkButton href="/signin">Sign In</LinkButton>
    </main>
  );
}
