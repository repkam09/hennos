import { createRequire } from 'module';
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "../workflows/activities.ts";
const require = createRequire(import.meta.url);


export class TemporalWorker {
    private static worker: Worker;

    static async instance(): Promise<Worker> {
        if (!TemporalWorker.worker) {
            const connection = await NativeConnection.connect({
                address: process.env.TEMPORAL_SERVER_ADDRESS,
            });
            const worker = await Worker.create({
                connection,
                taskQueue: "hennos",
                workflowsPath: require.resolve("../workflows"),
                activities,
            });
            TemporalWorker.worker = worker;
        }

        return TemporalWorker.worker;
    }
}