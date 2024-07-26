"use server";

import { getKv } from "@/kv";
import { MeetData, Race } from "@/structures";

export async function getRace(code: string) {
  const kv = await getKv();
  const race = (await kv.get<Race>(["race", code])).value;
  return race;
}

export async function getBibs(code: string) {
  const kv = await getKv();
  return (await kv.get<number[]>(["bibs", code])).value ?? [];
}

export async function getTimes(code: string) {
  const kv = await getKv();
  return (await kv.get<number[]>(["times", code])).value ?? [];
}

export async function getMeet(code: string) {
  const kv = await getKv();
  return (await kv.get<MeetData>(["meets", code])).value;
}
