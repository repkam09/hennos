
import * as workflow from "@temporalio/workflow";
import * as activities from "./activities/index"
import { defineSignal, setHandler } from '@temporalio/workflow';

interface IncomingMessageSignalInput {
    message: string;
    debug?: boolean;
}

type ChatCompletionQueueArgs = {
    userId: number;
    chatId: number;
    firstName?: string;
    lastName?: string;
    username?: string
};

const { completion, respond } = workflow.proxyActivities<typeof activities>({
    startToCloseTimeout: "10 minutes",
    retry: {
        maximumAttempts: 1
    }
});

// Allow the client to SignalWithStart us a message
export const incomingMessageSignal = defineSignal<[IncomingMessageSignalInput]>('incomingMessageSignal');

// This workflow is responsible for handling the chat queue for a single user
// the args, and workflowId, are based on the users unique Telegram UserID
export async function ChatCompletionQueue(
    args: ChatCompletionQueueArgs,
): Promise<string> {
    const messages: string[] = []
    let hasNewMessage = false
    let debugMode = false

    // Set up a handler for the incoming message signal

    // The client can send us a message to handle. If the user sends another message
    // in the time we're creating a response, we want to throw away our original response
    // and update with the additional information

    // This is also helpful if the user sends a REALLY long message and Telegram 
    // breaks it up into mutiple messages automatically. We want to capture all of it! 
    setHandler(incomingMessageSignal, ({ message, debug }: IncomingMessageSignalInput) => {
        messages.push(message)
        hasNewMessage = true
        debugMode = debug ? true : false
    });

    let result: string = ""
    while (hasNewMessage) {
        hasNewMessage = false
        const answer = await completion(args.userId, messages.join("\n"))
        result = answer.text
    }

    // If there were no new messages in the time we were generating our response,
    // respond to the user by their Telegram ChatID
    await respond(args.chatId, result, debugMode);

    return result
}