import { openKv, Kv } from "@deno/kv";

let kv: Kv | null = null;

const kvPromise = (async () => {
  const kvUrl = process.env.DENO_KV_URL;
  if (!kvUrl) {
    throw new Error("DENO_KV_URL environment variable is not set");
  }
  kv = await openKv(kvUrl);
  return kv;
})();

export const getKv = async (): Promise<Kv> => {
  if (!kv) {
    await kvPromise;
  }
  return kv as Kv;
};
