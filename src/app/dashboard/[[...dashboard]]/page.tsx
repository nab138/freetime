import Button from "@/components/Button";
import styles from "./dashboard.module.css";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  let session = await auth();
  if (!session || !session.user || !session.user.email) {
    redirect("/");
    return null;
  }

  return (
    <main className={styles.main}>
      <h1>FreeTime Dashboard</h1>
      <div className={styles.content}>
        <div className={styles.account + " " + styles.card}>
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
              <p style={{ color: "rgb(var(--foreground-secondary-rgb))" }}>
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
        </div>
      </div>
    </main>
  );
}
