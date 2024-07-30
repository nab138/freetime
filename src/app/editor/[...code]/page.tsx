import { MeetData, Race, UserData } from "@/structures";

import LinkButton from "@/components/LinkButton";
import { getKv } from "@/kv";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ResultsEditor from "./ResultsEditor";

export const dynamic = "force-dynamic";

export default async function ResultsEditorPage({
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

  if (!race) {
    return (
      <main>
        <h1>Failed to retrieve race data.</h1>
      </main>
    );
  }

  let bibs = (await kv.get<number[]>(["bibs", raceCode])).value;
  let times = (await kv.get<number[]>(["times", raceCode])).value;

  return (
    <main>
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1>Results Editor</h1>
          <h3>
            {meet.name} - {race.name}
          </h3>
        </div>
        {bibs !== null && times !== null && race.startTime !== undefined && (
          <ResultsEditor
            bibsRaw={bibs}
            timesRaw={times}
            roster={meet.roster}
            startTime={race.startTime}
            raceCode={race.code}
            meetCode={meet.code}
          />
        )}
      </div>
    </main>
  );
}
