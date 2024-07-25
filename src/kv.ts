import { openKv, Kv } from "@deno/kv";

let kv: Kv | null = null;

const kvPromise = (async () => {
  kv = await openKv(
    "https://api.deno.com/databases/73b2c83f-70f3-4a0f-827c-d57dc23a332f/connect"
  );
  return kv;
})();

export const getKv = async (): Promise<Kv> => {
  if (!kv) {
    await kvPromise;
  }
  return kv as Kv;
};
