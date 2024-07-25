"use server";

import { MeetData } from "@/structures";
import { kv } from "@vercel/kv";

export async function deleteRace(code: string, meet: MeetData) {
  if ((await kv.exists("race-" + code)) === 0) {
    return {
      error: "Invalid race code. This race may have already been deleted.",
    };
  }
  await kv.del("race-" + code);

  if ((await kv.exists(meet.code)) === 0) {
    return {
      error: "Invalid meet code. This race is not associated with a meet.",
    };
  }
  meet.races.filter((r) => r !== code);
  await kv.set(meet.code, meet);
}
