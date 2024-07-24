"use server";

import { MeetData } from "@/structures";
import { kv } from "@vercel/kv";

export async function addAthleteToMeetRoster(
  code: string,
  bib: number,
  name: string,
  age: number
) {
  if ((await kv.exists(code)) === 0) {
    return { error: "Invalid meet code." };
  }
  let meet = await kv.get<MeetData>(code);
  if (!meet) {
    return { error: "Failed to retrieve meet data." };
  }
  meet?.roster.push({ bib, name, age });
  await kv.set(code, meet);
}
