import 'dotenv/config'

import { Client, Connection } from "@temporalio/client";
import { stat, readdir } from "node:fs/promises"
import { createHash } from "node:crypto"
import { ParseDocument } from './workflows/index.ts';
import mime from "mime-types"
import path from "node:path";

const connection = await Connection.connect({
    address: process.env.TEMPORAL_SERVER_ADDRESS
});

const client = new Client({
    connection
})

async function parseDocument(path: string) {
    const details = await stat(path)
    const mimetype = mime.lookup(path)

    const hash = createHash('sha256')
    hash.update(path)
    const uid = hash.digest('hex')

    const document = {
        "file_name": path,
        "mime_type": mimetype ? mimetype : 'unknown',
        "file_id": uid,
        "file_unique_id": uid,
        "file_size": details.size
    }

    client.workflow.start(ParseDocument, {
        args: [{
            chatId: 89941288,
            userId: 89941288,
            document,
            path
        }],
        taskQueue: 'hennos',
        workflowId: `chat:${89941288}|user:${89941288}|document:${document.file_unique_id}|ParseDocument`,
    });
}

if (process.argv.length === 2) {
    console.error('Expected at least one argument!');
    process.exit(1);
}

async function ingest(basepath: string) {
    const stats = await stat(basepath)
    if (!stats.isDirectory()) {
        return parseDocument(basepath)
    }
    
    const contents = await readdir(basepath)
    contents.forEach(async (content) => {
        const current = path.join(basepath, content)
        const stats = await stat(current)
        if (!stats.isDirectory()) {
            console.log(current)
            return parseDocument(current)
        } else {
            return ingest(current)
        }
    })
}

const basepath = process.argv[2]
ingest(basepath)