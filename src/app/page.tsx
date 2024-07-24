import Image from "next/image";
import styles from "./page.module.css";
import { auth, signIn } from "@/auth";
import GoogleSignin from "@/components/GoogleSignin";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <main>
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
      <p>Freetime is currently in closed beta.</p>
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
