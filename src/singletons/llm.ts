import { BaseChatModel } from "langchain/chat_models/base";
import { ChatMessage, HumanMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatOllama } from "langchain/chat_models/ollama"
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Embeddings } from "langchain/embeddings/base";
import { ConsoleCallbackHandler } from "langchain/callbacks";

export class LangChainLLM {
    private static chat_model: BaseChatModel;
    private static chat_embeddings: Embeddings

    public static indexName: string = "hennos"
    public static verbose: boolean = false

    static async initialize(): Promise<void> {
        if (process.env.OPENAI_LLM) {
            console.log("Configured to use OpenAI " + process.env.OPENAI_LLM)
            LangChainLLM.chat_model = new ChatOpenAI({
                modelName: process.env.OPENAI_API_LLM,
                callbacks: [new ConsoleCallbackHandler()]
            });
            LangChainLLM.chat_embeddings = new OpenAIEmbeddings({
                modelName: "text-embedding-ada-002",
            })
        }

        if (process.env.OLLAMA_LLM) {
            console.log("Configured to use Ollama " + process.env.OLLAMA_LLM)
            LangChainLLM.chat_model = new ChatOllama({
                model: process.env.OLLAMA_LLM,
                callbacks: [new ConsoleCallbackHandler()]
            });
            LangChainLLM.chat_embeddings = new OllamaEmbeddings({
                model: process.env.OLLAMA_LLM
            })
        }
    }

    static model(): BaseChatModel {
        return LangChainLLM.chat_model;
    }

    static humanMessage(content: string): HumanMessage {
        return new HumanMessage(content)
    }

    static createCompletion(messages: ChatMessage[]) {
        return LangChainLLM.chat_model.predictMessages(messages)
    }

    static embeddings() {
        return LangChainLLM.chat_embeddings
    }

}