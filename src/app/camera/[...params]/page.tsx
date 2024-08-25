import { auth } from "@/auth";
import LinkButton from "@/components/LinkButton";
import { getKv } from "@/kv";
import { MeetData, Race, UserData } from "@/structures";
import { redirect } from "next/navigation";
import React from "react";
import Camera from "./camera";

export default async function CameraPage({
  params,
}: {
  params: {
    params: string[];
  };
}) {
  if (params.params.length !== 2 && params.params.length !== 3) {
    return (
      <main>
        <h1>Invalid URL</h1>
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

  let meetCode = params.params[0];
  let raceCode = params.params[1];
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

  return (
    <main>
      <h1>
        Camera - {meet.name}: {race.name}
      </h1>
      <Camera filename={meet.name + " - " + race.name} />
    </main>
  );
}
