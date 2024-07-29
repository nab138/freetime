import styles from "./signin.module.css";

import { signIn } from "@/auth";
import Button from "@/components/Button";
import GoogleSignin from "@/components/GoogleSignin";
import LinkButton from "@/components/LinkButton";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

export default async function SignIn() {
  return (
    <main>
      <div className={styles.header}>
        <h1>Sign-in</h1>
        <h3>
          Signing in is for race officials only. If you are looking for live
          results, they are on the home page.
        </h3>
        <LinkButton href="/">Home</LinkButton>
      </div>
      <form
        className={styles.signInForm}
        action={async (formData) => {
          "use server";
          try {
            await signIn("credentials", formData);
            redirect("/dashboard");
          } catch (e) {
            if (isRedirectError(e)) {
              throw e;
            } else {
              console.error(e);
            }
          }
        }}
      >
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" />
        </label>
        <Button type="submit">Sign In</Button>
      </form>
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
