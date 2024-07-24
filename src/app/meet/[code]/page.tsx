import { auth } from "@/auth";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { MeetData, UserData } from "@/structures";
import { kv } from "@vercel/kv";
import { redirect } from "next/navigation";

export default async function Meet({ params }: { params: { code: string } }) {
  let session = await auth();
  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  let data = await kv.get<UserData>(session.user.email);
  if (!data) {
    data = { email: session.user.email, meets: [] };
    await kv.set(session.user.email, data);
  }
  let meet: MeetData | null = null;
  if (data.meets.includes(params.code)) {
    meet = await kv.get<MeetData>(params.code);
  }
  if (!meet) {
    return (
      <main>
        <h1>Unkown meet</h1>
        <p>Meet not found, or you do not have access!</p>
        <form
          action={async () => {
            "use server";
            redirect("/dashboard");
          }}
        >
          <Button type="submit">Return to dashboard</Button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <h1>{meet.name}</h1>
      <Card>
        <p>Admin Code: {meet.adminCode}</p>
      </Card>
    </main>
  );
}
