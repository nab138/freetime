"use server";

import { Athlete, MeetData, Race } from "@/structures";
import { kv } from "@vercel/kv";
import { generate } from "random-words";

export async function addAthleteToMeetRoster(
  code: string,
  bib: number,
  name: string,
  age: number,
  gender: string,
  team: string
) {
  let meet = await kv.get<MeetData>(code);
  if (!meet) {
    return { error: "Failed to retrieve meet data." };
  }
  meet?.roster.push({ bib, name, age, gender, team });
  await kv.set(code, meet);
}

export async function addAthletesToMeetRoster(
  meet: MeetData,
  athletes: Athlete[]
) {
  meet.roster = meet.roster.concat(athletes);
  await kv.set(meet.code, meet);
}

export async function clearRoster(meet: MeetData) {
  meet.roster = [];
  await kv.set(meet.code, meet);
}

export async function deleteMeet(code: string, adminCode: string) {
  await kv.del(code);
  await kv.del("admin-" + adminCode);
}

export async function deleteStudentFromMeet(meet: MeetData, index: number) {
  meet.roster.splice(index, 1);
  await kv.set(meet.code, meet);
}

export async function createRace(name: string, meet: MeetData) {
  let code = generateCode();
  let iter = 0;
  while ((await kv.exists("race-" + code)) > 1) {
    if (iter > 10) {
      return { error: "Failed to generate a unique code. Please try again." };
    }
    code = generateCode();
    iter++;
  }
  let race: Race = {
    meet: meet.code,
    code,
    name,
    bibs: [],
    times: [],
  };
  meet.races.push(code);
  await Promise.all([
    kv.set("race-" + race.code, race),
    kv.set(meet.code, meet),
  ]);
}

function generateCode() {
  return generate({ maxLength: 6 }) + randomNumber(10, 99).toString();
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
