import { Kv, makeRemoteService } from "kv-connect-kit";
import { deserialize, serialize } from "v8";

const accessToken = process.env.DENO_KV_ACCESS_TOKEN;
if (accessToken === undefined)
  throw new Error(
    `Set your personal access token: https://dash.deno.com/account#access-tokens`
  );
const { openKv } = makeRemoteService({
  accessToken,
  wrapUnknownValues: true,
  encodeV8: serialize,
  decodeV8: deserialize,
});

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
