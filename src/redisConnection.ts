import { createClient } from "redis";

export const redisConnection = createClient();

export async function connectToRedis() {
  await redisConnection.connect();
}
