"use server";

import { getKv } from "@/kv";
import { MeetData } from "@/structures";

export async function deleteRace(code: string, meet: MeetData) {
  const kv = await getKv();
  await kv.delete(["race", code]);
  meet.races.filter((r) => r !== code);
  await kv.set(["meets", meet.code], meet);
}
