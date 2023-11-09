import TelegramBot from "node-telegram-bot-api";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RedisInstance } from "../../../singletons/redis.ts";
import { processDocuments } from "./common.ts";

export async function parsePDF(chatId: number, userId: number, document: TelegramBot.Document, path: string): Promise<[string, string]> {
    const redis = RedisInstance.instance()
    const hasRecord = await redis.get('handled:' + document.file_unique_id)
    if (!hasRecord) {
        const loader = new PDFLoader(path, {
            splitPages: false,
        });
        const docs = await loader.load()

        processDocuments(docs)

        redis.set('handled:' + document.file_unique_id, JSON.stringify({
            chatId,
            userId,
            document,
            path
        }))
        return ['created', 'document:' + document.file_unique_id]
    }
    return ['existing', 'document:' + document.file_unique_id]
}