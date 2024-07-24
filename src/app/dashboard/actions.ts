"use server";

import { MeetData, UserData } from "@/structures";
import { kv } from "@vercel/kv";
import { Session } from "next-auth";
import { generate } from "random-words";

export const createMeet = async (session: Session, name: string) => {
  if (!session.user || !session.user.email) {
    return;
  }
  let userData = await kv.get<UserData>(session.user.email);
  if (!userData) {
    userData = { email: session.user.email, meets: [] };
  }
  let code = generateCode();
  let iter = 0;
  while ((await kv.exists(code)) > 1) {
    if (iter > 10) {
      return { error: "Failed to generate a unique code. Please try again." };
    }
    code = generateCode();
    iter++;
  }

  userData.meets.push(code);
  await kv.set(session.user.email, userData);

  let adminCode = generateCode();
  iter = 0;
  while ((await kv.exists("admin-" + adminCode)) > 1) {
    if (iter > 10) {
      return {
        error: "Failed to generate a unique admin code. Please try again.",
      };
    }
    adminCode = generateCode();
    iter++;
  }

  let meetData: MeetData = { code, name, roster: [], adminCode };
  await Promise.all([
    kv.set(code, meetData),
    kv.set("admin-" + adminCode, code),
  ]);
};

export const joinMeet = async (session: Session, code: string) => {
  if (!session.user || !session.user.email) {
    return;
  }
  let userData = await kv.get<UserData>(session.user.email);
  if (!userData) {
    userData = { email: session.user.email, meets: [] };
  }

  if ((await kv.exists("admin-" + code)) === 0) {
    return { error: "Invalid admin code." };
  }
  let meetCode = await kv.get<string>("admin-" + code);
  if (!meetCode) {
    return { error: "Found admin code, but failed to get meet code." };
  }
  if (userData.meets.includes(meetCode)) {
    return { warning: "You are already in this meet." };
  }
  userData.meets.push(meetCode);
  await kv.set(session.user.email, userData);
};

function generateCode() {
  return generate({ maxLength: 6 }) + randomNumber(10, 99).toString();
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
