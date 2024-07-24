"use server";

import { Athlete, MeetData } from "@/structures";
import { kv } from "@vercel/kv";

export async function addAthleteToMeetRoster(
  code: string,
  bib: number,
  name: string,
  age: number,
  gender: string,
  team: string
) {
  if ((await kv.exists(code)) === 0) {
    return { error: "Invalid meet code." };
  }
  let meet = await kv.get<MeetData>(code);
  if (!meet) {
    return { error: "Failed to retrieve meet data." };
  }
  meet?.roster.push({ bib, name, age, gender, team });
  await kv.set(code, meet);
}

export async function addAthletesToMeetRoster(
  code: string,
  athletes: Athlete[]
) {
  if ((await kv.exists(code)) === 0) {
    return { error: "Invalid meet code." };
  }
  let meet = await kv.get<MeetData>(code);
  if (!meet) {
    return { error: "Failed to retrieve meet data." };
  }
  meet.roster = meet.roster.concat(athletes);
  await kv.set(code, meet);
}

export async function clearRoster(code: string) {
  if ((await kv.exists(code)) === 0) {
    return { error: "Invalid meet code." };
  }
  let meet = await kv.get<MeetData>(code);
  if (!meet) {
    return { error: "Failed to retrieve meet data." };
  }
  meet.roster = [];
  await kv.set(code, meet);
}

export async function deleteMeet(code: string, adminCode: string) {
  if ((await kv.exists(code)) === 0) {
    return {
      error: "Invalid meet code. This meet may have already been deleted.",
    };
  }
  await kv.del(code);

  if ((await kv.exists("admin-" + adminCode)) === 0) {
    return {
      error: "Invalid admin code. This meet may have already been deleted.",
    };
  }
  await kv.del("admin-" + adminCode);
}

export async function deleteStudentFromMeet(meet: MeetData, index: number) {
  meet.roster.splice(index, 1);
  await kv.set(meet.code, meet);
}
