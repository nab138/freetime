import Image from "next/image";
import styles from "./page.module.css";
import { signIn } from "@/auth";
import GoogleSignin from "@/components/GoogleSignin";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Image
          src="/logo.png"
          alt="FreeTime Logo"
          width={576 / 4}
          height={672 / 4}
        />
        <div>
          <h1>FreeTime</h1>
          <h2>A Flusche & Sharp project</h2>
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <GoogleSignin />
      </form>
    </main>
  );
}
