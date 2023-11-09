import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { RedisInstance } from "../../../singletons/redis.ts";
import { LangChainLLM } from "../../../singletons/llm.ts";
import { Document } from "langchain/document";

export async function processDocuments(docs: Document[]): Promise<void> {
    const textSplitter = new RecursiveCharacterTextSplitter({
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

}