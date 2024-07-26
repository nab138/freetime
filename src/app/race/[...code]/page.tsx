import Card from "@/components/Card";
import { MeetData, Race, UserData } from "@/structures";

import styles from "./race.module.css";
import RaceDeleteButton from "./RaceDeleteButton";
import LinkButton from "@/components/LinkButton";
import Timing from "./timing/Timing";
import { getKv } from "@/kv";
import Bibs from "./Bibs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ResultsPrinter from "./ResultsPrinter";
import AgeRanges from "./AgeRanges";

export const dynamic = "force-dynamic";

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

  let meetCode = params.code[0];
  let raceCode = params.code[1];
  let meet: MeetData | null = null;
  if (data.meets.includes(meetCode)) {
    meet = (await kv.get<MeetData>(["meets", meetCode])).value;
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
  if (!meet.races.includes(raceCode)) {
    return (
      <main>
        <h1>Race not found in meet.</h1>
      </main>
    );
  }
  let race = (await kv.get<Race>(["race", raceCode])).value;
  let roster = meet.roster;
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
            <Timing raceCode={raceCode} />
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
            <Bibs raceCode={raceCode} roster={roster} />
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

  let bibs = (await kv.get<number[]>(["bibs", raceCode])).value;
  let times = (await kv.get<number[]>(["times", raceCode])).value;

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
          <p>
            <strong>Race Code:</strong> {race.code}
          </p>
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <p style={{ marginRight: "5px" }}>
              <strong>Distance (mi): </strong>
            </p>
            <input
              className={styles.ageRangeInput}
              type="number"
              placeholder="Distance"
            />
          </div>
          <RaceDeleteButton meet={meet} raceCode={race.code} />
        </Card>
        <Card>
          <h2>Timing</h2>
          <div className={styles.buttons}>
            <LinkButton href={`/race/${meetCode}/${raceCode}/timer`}>
              I&apos;m a timer
            </LinkButton>
            <LinkButton href={`/race/${meetCode}/${raceCode}/bibs`}>
              I&apos;m a bib reader
            </LinkButton>
          </div>
        </Card>
        <Card>
          <h2>Results</h2>

          {(bibs === null || times === null) && <p>No results yet.</p>}
          {bibs !== null && times !== null && (
            <>
              <ResultsPrinter
                race={race}
                meet={meet}
                bibs={bibs}
                times={times}
              />
              <div className={styles.finishersTableContainer}>
                <table className={styles.finishersTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Bib</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bibs.map((bib, index) => (
                      <tr key={index}>
                        <td>
                          {roster.find((a) => a.bib === bib)?.name ??
                            "Unkown Runner"}
                        </td>
                        <td>{bib}</td>
                        <td>
                          {times.length <= index &&
                          race.startTime !== undefined &&
                          race.startTime !== null
                            ? "N/A"
                            : formatTimeDifference(
                                new Date(race.startTime as number),
                                new Date(times[index]),
                                true
                              )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
        <Card>
          <h2>Age Ranges</h2>
          <AgeRanges
            meet={meet}
            race={race}
            bibs={bibs ?? []}
            times={times ?? []}
          />
        </Card>
      </div>
    </main>
  );
}

function formatTimeDifference(
  startTime: Date,
  currentTime: Date,
  subSeconds: boolean = false
): string {
  const timeDifference = currentTime.getTime() - startTime.getTime();

  const totalSeconds = Math.floor(timeDifference / 1000);
  const milliseconds = timeDifference % 1000;

  // Extract hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format hours, minutes, and seconds to be two digits
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (subSeconds) {
    const formattedMilliseconds = String(
      Math.floor(milliseconds / 10)
    ).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  }

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
