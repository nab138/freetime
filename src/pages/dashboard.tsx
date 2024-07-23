import styles from "./dashboard.module.css";
import { signIn } from "@/auth";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>FreeTime Dashboard</h1>
    </main>
  );
}
