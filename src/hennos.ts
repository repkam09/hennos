import 'dotenv/config'
import os from "node:os"

import { Client, Connection } from '@temporalio/client';
import { BotInstance } from "./singletons/telegram.ts"
import { RedisInstance } from "./singletons/redis.ts"
import { ChatCompletionQueue, incomingMessageSignal } from './workflows/chat-completion/workflow.ts';
import { TemporalWorker } from "./singletons/worker.ts"
import { ParseDocument } from './workflows/index.ts';
import { LangChainLLM } from './singletons/llm.ts';
import { processDocuments } from './workflows/parse-document/activities/common.ts';
import { Document } from 'langchain/document';


async function initialize() {
    const redis = RedisInstance.instance()
    await redis.connect()

    const connection = await Connection.connect({
        address: process.env.TEMPORAL_SERVER_ADDRESS
    });

    const client = new Client({
        connection
    })

    await LangChainLLM.initialize()

    if (process.env.ENABLE_TELEGRAM) {
        telegram(client)
    }

    // Cheap and dirty way of populating the document embedding store early on 
    processDocuments([new Document({ pageContent: "Hennos is a Telegram chat bot that uses the OpenAI API to respond to user queries" })])

    const worker = await TemporalWorker.instance()
    await worker.run()
}

async function telegram(client: Client) {
    BotInstance.instance().on('text', ({ chat, text, from }) => {
        console.log("Telegram Text: ", chat.id, text)

        const chatId = chat.id
        const userId = from ? from.id : chat.id

        client.workflow.signalWithStart(ChatCompletionQueue, {
            signal: incomingMessageSignal,
            signalArgs: [{
                message: text!
            }],
            args: [{
                chatId,
                userId,
                firstName: chat.first_name,
                lastName: chat.last_name,
                username: chat.username

            }],
            taskQueue: 'hennos',
            workflowId: `chat:${chatId}|user:${userId}|ChatCompletionQueue`,
        });
    })

    BotInstance.instance().on('document', async ({ chat, document, from }) => {
        console.log("Telegram Document: ", chat.id, document)

        const chatId = chat.id
        const userId = from ? from.id : chat.id

        const path = await BotInstance.instance().downloadFile(document!.file_id, os.tmpdir())

        client.workflow.start(ParseDocument, {
            args: [{
                chatId,
                userId,
                document: document!,
                path
            }],
            taskQueue: 'hennos',
            workflowId: `chat:${chatId}|user:${userId}|document:${document!.file_unique_id}|ParseDocument`,
        });
    })
}

initialize()
