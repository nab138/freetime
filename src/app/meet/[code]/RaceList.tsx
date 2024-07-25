"use client";

import ClientButton from "@/components/ClientButton";
import styles from "./meet.module.css";

import { MeetData, Race } from "@/structures";
import Link from "next/dist/client/link";
import { toast } from "sonner";
import { createRace } from "./actions";

export default function RaceList({
  meet,
  races,
}: {
  meet: MeetData;
  races: Race[];
}) {
  return (
    <div className={styles.raceList}>
      {races.length > 0 && (
        <ul>
          {races.map((race) => (
            <li key={race.code}>
              <Link href={`/race/${meet.code}/${race.code}`}>{race.name}</Link>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.rosterButtons} style={{ marginTop: "15px" }}>
        <input type="text" id="racename" placeholder="Race Name" required />
        <ClientButton
          onClick={async () => {
            "use client";
            let name = (document.getElementById("racename") as HTMLInputElement)
              .value;
            if (name === "") {
              toast.warning("Race name cannot be empty");
              return;
            }
            let result = await createRace(name ?? "Unamed race", meet);
            if (result && result.error) {
              toast.error(result.error);
            } else {
              window.location.reload();
            }
          }}
        >
          Create Race
        </ClientButton>
      </div>
    </div>
  );
}
