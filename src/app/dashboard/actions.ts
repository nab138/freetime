"use server";

import { getKv } from "@/kv";
import { MeetData, UserData } from "@/structures";

import { Session } from "next-auth";
import { generate } from "random-words";

export const createMeet = async (session: Session, name: string) => {
  const kv = await getKv();
  if (!session.user || !session.user.email) {
    return;
  }
  let userData = (await kv.get<UserData>(["users", session.user.email])).value;
  if (!userData) {
    userData = { email: session.user.email, meets: [] };
  }
  let code = generateCode();
  let iter = 0;
  while ((await kv.get<MeetData>(["meets", code])).value !== null) {
    if (iter > 10) {
      return { error: "Failed to generate a unique code. Please try again." };
    }
    code = generateCode();
    iter++;
  }

  userData.meets.push(code);
  await kv.set(["users", session.user.email], userData);

  let adminCode = generateCode();
  iter = 0;
  while ((await kv.get(["admin", adminCode])).value !== null) {
    if (iter > 10) {
      return {
        error: "Failed to generate a unique admin code. Please try again.",
      };
    }
    adminCode = generateCode();
    iter++;
  }

  let meetData: MeetData = { code, name, roster: [], adminCode, races: [] };
  await Promise.all([
    kv.set(["meets", code], meetData),
    kv.set(["admin", adminCode], code),
  ]);
};

export const joinMeet = async (session: Session, code: string) => {
  const kv = await getKv();
  if (!session.user || !session.user.email) {
    return;
  }
  let userData = (await kv.get<UserData>(["users", session.user.email])).value;
  if (!userData) {
    userData = { email: session.user.email, meets: [] };
  }

  let meetCode = (await kv.get<string>(["admin", code])).value;
  if (!meetCode) {
    return { error: "Failed to find associated meet" };
  }
  if (userData.meets.includes(meetCode)) {
    return { warning: "You are already in this meet." };
  }
  userData.meets.push(meetCode);
  await kv.set(["users", session.user.email], userData);
};

function generateCode() {
  return generate({ maxLength: 6 }) + randomNumber(10, 99).toString();
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
