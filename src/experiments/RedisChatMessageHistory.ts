import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "langchain/stores/message/ioredis";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";

const memory = new BufferMemory({
  chatHistory: new RedisChatMessageHistory({
    sessionId: new Date().toISOString(), // Or some other unique identifier for the conversation
    url: "redis://localhost:6379", // Default value
  }),
});

const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY
});

const chain = new ConversationChain({ llm: model, memory });

const res1 = await chain.call({ input: "Hi! I'm Mark." });
console.log({ res1 }); // text: "Hello Mark! It's nice to meet you. My name is AI. How may I assist you today?"

const res2 = await chain.call({ input: "What did I just say my name was?" });
console.log({ res2 }); //text: "You said your name was Mark."
