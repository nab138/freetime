import Card from "@/components/Card";
import { getKv } from "@/kv";
import { MeetData, Race } from "@/structures";
import Link from "next/link";
import LiveResults from "./LiveResults";
import LinkButton from "@/components/LinkButton";

export default async function Results({
  params,
}: {
  params: { data: string[] };
}) {
  const kv = await getKv();
  if (params.data.length < 1) {
    return (
      <main>
        <h1>Invalid URL.</h1>
      </main>
    );
  }
  let meetCode = params.data[0];
  let meet = (await kv.get<MeetData>(["meets", meetCode])).value;
  if (!meet) {
    return (
      <main>
        <h1>Unkown meet</h1>
      </main>
    );
  }

  if (params.data.length === 2) {
    let raceCode = params.data[1];
    let race = (await kv.get<Race>(["race", raceCode])).value;
    if (!race) {
      return (
        <main>
          <h1>Unkown Race</h1>
        </main>
      );
    }
    return (
      <main>
        <div
          style={{
            display: "flex",
            gap: "25px",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>
              {meet.name} - {race.name}
            </h1>
            <h3 style={{ marginBottom: "10px" }}>
              FreeTime - Flusche & Sharp Timing
            </h3>
            <LinkButton href={"/results/" + meetCode}>Back to meet</LinkButton>
          </div>
          <LiveResults meetCode={meet.code} raceCode={race.code} />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div style={{ textAlign: "center" }}>
        <h1>{meet.name}</h1>
        <h3 style={{ marginBottom: "10px" }}>
          FreeTime - Flusche & Sharp Timing
        </h3>
        <LinkButton href={"/"}>Back to home</LinkButton>
      </div>
      <Card>
        <h2>Races:</h2>
        <ul style={{ listStyle: "none", textDecoration: "underline" }}>
          {meet.races.map(async (raceCode, i) => {
            let race = (await kv.get<Race>(["race", raceCode])).value;
            if (!race) return;
            return (
              <li key={raceCode}>
                <Link href={"/results/" + meetCode + "/" + raceCode}>
                  {race.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </main>
  );
}
