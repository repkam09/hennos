import TelegramBot from "node-telegram-bot-api";

export class BotInstance {
    private static bot: TelegramBot;

    static instance(): TelegramBot {
        if (!BotInstance.bot) {
            BotInstance.bot = new TelegramBot(process.env.TELEGRAM_BOT_KEY!, { polling: true });
        }

        return BotInstance.bot;
    }
}