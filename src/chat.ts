import { Client, Connection } from "@temporalio/client";
import { ChatCompletionQueue, incomingMessageSignal } from './workflows/index.ts';

if (process.argv.length === 2) {
    console.error('Expected at least one argument!');
    process.exit(1);
}

const connection = await Connection.connect({
    address: "localhost:7233"
});

const client = new Client({
    connection
})

const message = process.argv.splice(2, process.argv.length - 1).join("")

console.log("Input:", message)

client.workflow.signalWithStart(ChatCompletionQueue, {
    signal: incomingMessageSignal,
    signalArgs: [{
        message,
        debug: true
    }],
    args: [{
        chatId: 89941288,
        userId: 89941288,
        firstName: undefined,
        lastName: undefined,
        username: undefined

    }],
    taskQueue: 'hennos',
    workflowId: `chat:${89941288}|user:${89941288}|ChatCompletionQueue`,
});