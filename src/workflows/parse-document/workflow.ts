import TelegramBot from "node-telegram-bot-api";
import * as workflow from "@temporalio/workflow";
import * as activities from "./activities/index.ts"

type ParseDocumentInput = {
    userId: number;
    chatId: number;
    document: TelegramBot.Document
    path: string
};

const { parsePlainText, parsePDF, parseTypeScript } = workflow.proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute",
});

export async function ParseDocument(
    args: ParseDocumentInput
): Promise<[string, string]> {
    switch (args.document.mime_type) {
        case 'text/plain': {
            return parsePlainText(args.chatId, args.userId, args.document, args.path)
            break
        }
        
        case 'video/mp2t': {
            return parseTypeScript(args.chatId, args.userId, args.document, args.path)
            break
        }

        case 'text/markdown': {
            return parsePlainText(args.chatId, args.userId, args.document, args.path)
            break
        }

        case 'application/pdf': {
            return parsePDF(args.chatId, args.userId, args.document, args.path)
            break
        }

        default: {
            throw workflow.ApplicationFailure.fromError(
                new Error("Unhandled File Type:" + args.document.mime_type), { nonRetryable: true }
            )
        }
    }
}