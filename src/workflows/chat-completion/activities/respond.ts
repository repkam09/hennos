import { BotInstance } from "../../../singletons/telegram.ts"

export async function respond(uid: number, content: string, debug: boolean): Promise<void> {
    if (debug) {
        console.log("DEBUG: ", uid, content)
    } else {
        await BotInstance.instance().sendMessage(uid, content)
    }
}