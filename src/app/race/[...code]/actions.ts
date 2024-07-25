"use server";

import { MeetData } from "@/structures";
import { kv } from "@vercel/kv";

export async function deleteRace(code: string, meet: MeetData) {
  await kv.del("race-" + code);
  meet.races.filter((r) => r !== code);
  await kv.set(meet.code, meet);
}
