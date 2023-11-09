import { Ollama } from "langchain/llms/ollama";
import {
    loadQAMapReduceChain,
} from "langchain/chains";
import { Document } from "langchain/document";

const docs = [
    new Document({ pageContent: "Harrison went to Harvard." }),
    new Document({ pageContent: "Ankush went to Princeton." }),
];

// Optionally limit the number of concurrent requests to the language model.
const llmB = new Ollama({  model: "vicuna:13b-16k", maxConcurrency: 2 });
const chainB = loadQAMapReduceChain(llmB);
const resB = await chainB.call({
    input_documents: docs,
    question: "Where did Harrison go to college?",
});
console.log({ resB }); // text: 'Harrison went to Harvard.'