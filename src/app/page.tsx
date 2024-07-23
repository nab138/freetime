import styles from "./page.module.css";
import { signIn } from "@/auth";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>FreeTime</h1>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit">Signin with Google</button>
      </form>
    </main>
  );
}
