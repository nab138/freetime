import Button from "@/components/Button";
import styles from "./dashboard.module.css";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { kv } from "@vercel/kv";
import { MeetData, UserData } from "@/structures";
import { generate } from "random-words";
import { Session } from "next-auth";
import Card from "@/components/Card";
import { toast } from "sonner";

export default async function Home() {
  let session = await auth();
  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  let data = await kv.get<UserData>(session.user.email);
  let meets: MeetData[] = [];
  if (!data) {
    data = { email: session.user.email, meets: [] };
    await kv.set(session.user.email, data);
  }
  for (let code of data.meets) {
    let meet = await kv.get<MeetData>(code);
    if (meet) {
      meets.push(meet);
    }
  }

  return (
    <main>
      <h1>FreeTime Dashboard</h1>
      <div className={styles.content}>
        <Card className={styles.account}>
          <h2>Account</h2>
          <div className={styles.accountDetails}>
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User Image"}
                width={64}
                height={64}
                style={{ borderRadius: "5px" }}
              />
            )}
            <div>
              <p>Logged in as {session?.user?.name}</p>
              <p
                style={{
                  color: "rgb(var(--foreground-secondary-rgb))",
                }}
              >
                {session?.user?.email}
              </p>
            </div>
          </div>
          <form
            className={styles.accountButtons}
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button type="submit">Sign Out</Button>
          </form>
        </Card>
        <Card className={styles.meets}>
          <h2>Meets</h2>
          {data.meets.length === 0 ? (
            <p>You have no meets. Create one to get started!</p>
          ) : (
            <ul>
              {meets.map((meet) => (
                <li key={meet.code}>
                  <a href={`/meet/${meet.code}`}>
                    {meet.name + " - " + meet.code}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <form
            className={styles.accountButtons}
            action={async (data: FormData) => {
              "use server";
              await createMeet(
                session,
                (data.get("name") ?? "Unamed Meet").toString()
              );
              redirect("/dashboard");
            }}
          >
            {/* Add name field */}
            <input type="text" name="name" placeholder="Meet Name" required />
            <Button type="submit">Create Meet</Button>
          </form>
          <p style={{ marginTop: "15px" }}>
            {data.meets.length === 0 ? "Or, i" : "I"}f you have an admin code:
          </p>
          <form
            className={styles.accountButtons}
            action={async (data: FormData) => {
              "use server";
              await joinMeet(session, (data.get("admincode") ?? "").toString());
              redirect("/dashboard");
            }}
          >
            {/* Add name field */}
            <input
              type="text"
              name="admincode"
              placeholder="Admin Code"
              required
            />
            <Button type="submit">Add Meet</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

function generateCode() {
  return generate({ maxLength: 6 }) + randomNumber(10, 99).toString();
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const createMeet = async (session: Session, name: string) => {
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
      toast.error("Failed to generate a unique code. Please try again.");
      return;
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
      toast.error("Failed to generate a unique admin code. Please try again.");
      return;
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

const joinMeet = async (session: Session, code: string) => {
  if (!session.user || !session.user.email) {
    return;
  }
  let userData = await kv.get<UserData>(session.user.email);
  if (!userData) {
    userData = { email: session.user.email, meets: [] };
  }

  if ((await kv.exists("admin-" + code)) === 0) {
    toast.error("Invalid admin code.");
    return;
  }
  let meetCode = await kv.get<string>("admin-" + code);
  if (!meetCode) {
    toast.error("Found admin code, but failed to get meet code.");
    return;
  }
  if (userData.meets.includes(meetCode)) {
    toast.warning("You are already in this meet.");
    return;
  }
  userData.meets.push(meetCode);
  await kv.set(session.user.email, userData);
};
