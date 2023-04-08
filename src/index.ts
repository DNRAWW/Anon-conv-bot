import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { configureBot } from "./api";
import { connectToRedis, redisConnection } from "./redisConnection";
import mongoose from "mongoose";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URL as string);
  const bot = new Telegraf(process.env.API_KEY as string);
  connectToRedis();
  configureBot(bot);
  bot.launch();

  process.once("SIGINT", () => {
    bot.stop("SIGINT");
    redisConnection.quit();
  });
  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    redisConnection.quit();
  });
}

main().catch((err) => {
  redisConnection.quit();
  console.error(err);
  throw Error();
});
