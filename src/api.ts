import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { message } from "telegraf/filters";
import { QueueService } from "./services/queue.service";
import { UserStatusService } from "./services/userStatus.service";
import { ConnectionsService } from "./services/connections.service";

function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function configureBot(bot: Telegraf<Context<Update>>) {
  const userStatusService = new UserStatusService();
  const queueService = new QueueService(userStatusService);
  const connectionsService = new ConnectionsService(userStatusService);

  bot.start((ctx) => {
    ctx.reply("Для того чтобы начать поиск используйте команду /search");
  });

  bot.command("search", async (ctx) => {
    const userStatus = await userStatusService.getUserStatus(ctx.chat.id);

    if (userStatus) {
      ctx.reply("Вы уже подключены или находитесь в очереди");
      return;
    }

    const user1 = ctx.chat.id;
    const user2 = await queueService.search(ctx.chat.id);

    ctx.reply("Вы добавлены в очередь");

    if (user2) {
      await connectionsService.setConnection(user1, Number(user2));

      ctx.reply("Собеседник найден");
      bot.telegram.sendMessage(user2, "Собеседник найден");
    }
  });

  bot.command("stop", async (ctx) => {
    const userId = ctx.chat.id;
    const userStatus = await userStatusService.getUserStatus(userId);

    if (!userStatus || userStatus === "searching") {
      ctx.reply("Вы не находитесь в разговоре");
      return;
    }

    const userId2 = connectionsService.getConnectionByUser(userId);

    ctx.reply("Разговор остановлен");
    bot.telegram.sendMessage(userId2, "Разговор был остановлен собеседником");

    await connectionsService.stopConnection(userId);
  });

  bot.on(message("text"), async (ctx) => {
    const userId = ctx.chat.id;
    const userStatus = await userStatusService.getUserStatus(userId);
    if (userStatus === "connected") {
      const sendTo = connectionsService.getConnectionByUser(userId);
      const message = ctx.message.text;
      bot.telegram.sendMessage(sendTo, message);
    } else {
      ctx.reply("Вы не находитесь в разговоре или такой команды нет");
    }
  });
}
