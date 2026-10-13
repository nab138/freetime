// Thin wrapper around redis to mimic the denokv api just as a dirty hack
import { Redis } from "@upstash/redis";

type Key = readonly unknown[];

export type Kv = {
  get<T>(key: Key): Promise<{ value: T | null }>;
  set<T>(key: Key, value: T): Promise<void>;
  delete(key: Key): Promise<void>;
};

const redisKey = (key: Key) => JSON.stringify(["freetime", ...key]);

let redis: Redis | null = null;

const kvPromise = (async () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required",
    );
  }

  redis = new Redis({ url, token });
  return redis;
})();

export const getKv = async (): Promise<Kv> => {
  const client = redis ?? (await kvPromise);

  return {
    async get<T>(key: Key) {
      return { value: await client.get<T>(redisKey(key)) };
    },
    async set<T>(key: Key, value: T) {
      await client.set(redisKey(key), value);
    },
    async delete(key: Key) {
      await client.del(redisKey(key));
    },
  };
};
