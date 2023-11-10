import TelegramBot from "node-telegram-bot-api";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RedisInstance } from "../../../singletons/redis.ts";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { LangChainLLM } from "../../../singletons/llm.ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function parseTypeScript(chatId: number, userId: number, document: TelegramBot.Document, path: string): Promise<[string, string]> {
    const redis = RedisInstance.instance()
    const hasRecord = await redis.get('handled:' + document.file_unique_id)
    if (!hasRecord) {
        const loader = new TextLoader(path);
        const docs = await loader.load()

        const textSplitter = RecursiveCharacterTextSplitter.fromLanguage('js', {
            chunkSize: 500,
            chunkOverlap: 0
        });

        const splitDocs = await textSplitter.splitDocuments(docs);

        await RedisVectorStore.fromDocuments(
            splitDocs,
            LangChainLLM.embeddings(),
            {
                indexName: LangChainLLM.indexName,
                redisClient: RedisInstance.instance()
            }
        )

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
