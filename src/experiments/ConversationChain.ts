import { Ollama } from "langchain/llms/ollama";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const model = new Ollama({
    model: 'vicuna:13b-16k'
})

const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory: memory });
const res1 = await chain.call({ input: "Hi! My name is Mark. What can you tell me about nodejs backend development?" });
console.log({ res1 });

