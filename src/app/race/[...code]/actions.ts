"use server";

import { getKv } from "@/kv";
import { MeetData, Race } from "@/structures";

export async function deleteRace(code: string, meet: MeetData) {
  const kv = await getKv();
  await kv.delete(["race", code]);
  await kv.delete(["bibs", code]);
  await kv.delete(["times", code]);
  meet.races.filter((r) => r !== code);
  await kv.set(["meets", meet.code], meet);
}

export async function getStartTime(code: string) {
  const kv = await getKv();
  const time = (await kv.get<Race>(["race", code])).value?.startTime;
  return time;
}

export async function setRaceStartTime(code: string, time: number) {
  const kv = await getKv();
  let race = (await kv.get<Race>(["race", code])).value;
  if (!race) {
    return { error: "Failed to retrieve race data" };
  }
  race.startTime = time;
  await kv.set(["race", code], race);
}

export async function getTimes(code: string) {
  const kv = await getKv();
  return (await kv.get<number[]>(["times", code])).value ?? [];
}

export async function setTimes(code: string, times: number[]) {
  const kv = await getKv();
  await kv.set(["times", code], times);
}

export async function getBibs(code: string) {
  const kv = await getKv();
  return (await kv.get<number[]>(["bibs", code])).value ?? [];
}

export async function setServerBibs(code: string, bibs: number[]) {
  const kv = await getKv();
  await kv.set(["bibs", code], bibs);
}
