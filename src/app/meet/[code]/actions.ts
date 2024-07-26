"use server";

import { getKv } from "@/kv";
import { Athlete, MeetData, Race } from "@/structures";

import { generate } from "random-words";

export async function addAthleteToMeetRoster(
  code: string,
  bib: number,
  name: string,
  age: number,
  gender: string,
  team: string
) {
  const kv = await getKv();
  let meet = (await kv.get<MeetData>(["meets", code])).value;
  if (!meet) {
    return { error: "Failed to retrieve meet data." };
  }
  meet?.roster.push({ bib, name, age, gender, team });
  await kv.set(["meets", code], meet);
}

export async function addAthletesToMeetRoster(
  meet: MeetData,
  athletes: Athlete[]
) {
  const kv = await getKv();
  meet.roster = meet.roster.concat(athletes);
  await kv.set(["meets", meet.code], meet);
}

export async function clearRoster(meet: MeetData) {
  const kv = await getKv();
  meet.roster = [];
  await kv.set(["meets", meet.code], meet);
}

export async function deleteMeet(meet: MeetData) {
  const kv = await getKv();
  await kv.delete(["meets", meet.code]);
  await kv.delete(["admin", meet.adminCode]);
  for (let race of meet.races) {
    await kv.delete(["race", race]);
    await kv.delete(["bibs", race]);
    await kv.delete(["times", race]);
  }
}

export async function deleteStudentFromMeet(meet: MeetData, index: number) {
  const kv = await getKv();
  meet.roster.splice(index, 1);
  await kv.set(["meets", meet.code], meet);
}

export async function createRace(name: string, meet: MeetData) {
  const kv = await getKv();
  let code = generateCode();
  let iter = 0;
  while ((await kv.get(["race", code])).value !== null) {
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
  };
  meet.races.push(code);
  await Promise.all([
    kv.set(["race", race.code], race),
    kv.set(["meets", meet.code], meet),
  ]);
}

function generateCode() {
  return generate({ maxLength: 6 }) + randomNumber(10, 99).toString();
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
