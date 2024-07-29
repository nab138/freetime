import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getKv } from "./kv";
import { compareSync, hashSync } from "bcrypt-edge";
import { signInSchema } from "./lib/zod";
import { UserData } from "./structures";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;
        const { email, password } = await signInSchema.parseAsync(credentials);

        // logic to verify if the user exists
        const kv = await getKv();
        user = (await kv.get<UserData>(["users", email.toLowerCase()])).value;

        if (!user) {
          // No user found, so this is their first attempt to login
          // meaning this is also the place you could do registration
          throw new Error("User not found.");
        }

        if (!user.password) {
          const pwHash = hashSync(password, 10);
          user.password = pwHash;
          await kv.set(["users", email.toLowerCase()], user);
        }

        if (!compareSync(password, user.password)) {
          // Passwords do not match
          throw new Error("Invalid password");
        }
        // return user object with their profile data
        return user;
      },
    }),
  ],
});
