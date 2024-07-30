"use server";

import { getKv } from "@/kv";

export default async function save(
  raceCode: string,
  bibs: number[],
  times: number[]
) {
  const kv = await getKv();
  await kv.set(["bibs", raceCode], bibs);
  await kv.set(["times", raceCode], times);
}
