import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { message } from "telegraf/filters";
import { QueueService } from "./services/queue.service";
import { UserStatusService } from "./services/userStatus.service";
import { ConnectionsService } from "./services/connections.service";
import { UserInfoService } from "./services/userInformation.service";
import { userInfoValidation } from "./validation/userInfoValidation";

export function configureBot(bot: Telegraf<Context<Update>>) {
  const userStatusService = new UserStatusService();
  const queueService = new QueueService(userStatusService);
  const connectionsService = new ConnectionsService(userStatusService);
  const userInfoService = new UserInfoService(userStatusService);

  bot.start(async (ctx) => {
    ctx.reply(
      "Привет! Перед тем как начать общаться нужно написать какое-то описание себя. Оно должно быть от 10 до 400 символов (пробелы считаются)."
    );

    await userStatusService.setUserStatus(ctx.chat.id, "writing_bio");
  });

  bot.command("search", async (ctx) => {
    const userStatus = await userStatusService.getUserStatus(ctx.chat.id);

    if (userStatus === "writing_bio") {
      ctx.reply("Тебе нужно сначала написать описание");
      return;
    }

    if (userStatus) {
      ctx.reply("Вы уже в разговоре или находитесь в очереди");
      return;
    }

    const user1 = ctx.chat.id;
    const user2 = await queueService.search(ctx.chat.id);

    ctx.reply("Вы добавлены в очередь");

    if (user2) {
      await connectionsService.setConnection(user1, Number(user2));

      const bioUser1 = await userInfoService.getInfoById(user1);
      const bioUser2 = await userInfoService.getInfoById(Number(user2));

      ctx.reply("Собеседник найден");
      bot.telegram.sendMessage(user2, "Собеседник найден");

      if (bioUser2) {
        ctx.reply("Описание собеседника: \n" + bioUser2.bio);
      }

      if (bioUser1) {
        bot.telegram.sendMessage(
          user2,
          "Описание собеседника: \n" + bioUser1.bio
        );
      }
    }
  });

  bot.command("stop", async (ctx) => {
    const userId = ctx.chat.id;
    const userStatus = await userStatusService.getUserStatus(userId);

    if (userStatus === "writing_bio") {
      ctx.reply("Тебе нужно сначала написать описание");
      return;
    }

    if (userStatus === "searching") {
      ctx.reply("Поиск прекращён");
      queueService.deleteUserFromQueue(userId);
      return;
    }

    if (!userStatus) {
      ctx.reply("Вы не находитесь в разговоре");
      return;
    }

    const connection = await connectionsService.getConnectionByUser(userId);

    if (!connection) {
      throw Error("Something went wrong here with connection");
    }

    const userId2 =
      userId === connection.userId1 ? connection.userId2 : connection.userId1;

    ctx.reply("Разговор остановлен");
    bot.telegram.sendMessage(userId2, "Разговор был остановлен собеседником");

    await connectionsService.stopConnection(userId);
  });

  bot.on(message("text"), async (ctx) => {
    const userId = ctx.chat.id;
    const userStatus = await userStatusService.getUserStatus(userId);

    if (userStatus === "writing_bio") {
      const bioText = ctx.message.text;

      try {
        userInfoValidation.parse(bioText);
      } catch (err) {
        ctx.reply(
          "Текст описания должен быть от 10 до 400 символов. В твоём сообщении " +
            bioText.trim().length +
            " символов. (Лишние пробелы удаляются)"
        );
        return;
      }

      ctx.reply(
        "Твоё описание было сохранено, теперь можешь воспользоваться командой /search для поиска собеседника. Если захочешь сменить своё описание напиши /start ещё раз."
      );

      await userInfoService.saveInfo(userId, ctx.message.text.trim());
      return;
    }

    if (userStatus !== "connected") {
      ctx.reply("Ты не находишься в разговоре или такой команды нет");
      return;
    }

    const connection = await connectionsService.getConnectionByUser(userId);

    if (!connection) {
      throw Error("Something went wrong here with connection");
    }

    const userId2 =
      userId === connection.userId1 ? connection.userId2 : connection.userId1;

    const message = ctx.message.text;
    bot.telegram.sendMessage(userId2, message);
  });
}
