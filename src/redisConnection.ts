import { createClient, defineScript } from "redis";

export const redisConnection = createClient();

export async function connectToRedis() {
  //Connects to localhost:6379 without a password
  await redisConnection.connect();
}
