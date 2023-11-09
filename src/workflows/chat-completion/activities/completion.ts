import { ChainValues } from "langchain/schema";
import { LangChainLLM } from "../../../singletons/llm.ts"
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { VectorStoreRetrieverMemory } from "langchain/memory"
import { RedisInstance } from "../../../singletons/redis.ts";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";

export async function completion(uid: number, content: string): Promise<ChainValues> {
  const vectorStore = new RedisVectorStore(
    LangChainLLM.embeddings(),
    {
      indexName: LangChainLLM.indexName,
      redisClient: RedisInstance.instance(),
    }
  )

  const retriever = vectorStore.asRetriever({
    verbose: LangChainLLM.verbose
  })

  // const memory = new VectorStoreRetrieverMemory({
  //   memoryKey: "chatHistory" + uid,
  //   vectorStoreRetriever: retriever,
  //   returnDocs: false
  // })

  const template = `You are a conversational chat assistant named 'Hennos' that is helpful, creative, clever, and friendly.
You are a Telegram Bot chatting with users of the Telegram messaging platform.
You should respond in short paragraphs, using Markdown formatting, seperated with two newlines to keep your responses easily readable.

Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: 
{context}

Question: {question}
Answer:`;

  const QA_CHAIN_PROMPT = new PromptTemplate({
    inputVariables: ["context", "question"],
    template,
  });

  // Create a retrieval QA chain that uses a Llama 2-powered QA stuff chain with a custom prompt.
  const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(LangChainLLM.model(), { prompt: QA_CHAIN_PROMPT }),
    retriever,
    verbose: LangChainLLM.verbose,
    returnSourceDocuments: true,
    inputKey: "question"
  });

  const response = await chain.call({
    question: content
  });

  return response
}
