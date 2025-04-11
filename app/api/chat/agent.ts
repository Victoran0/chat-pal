import {ChatGroq} from "@langchain/groq";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/messages";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const tools = [new DuckDuckGoSearch({maxResults: 3, })];
const toolNode = new ToolNode(tools);

const prompt = ChatPromptTemplate.fromMessages([
    ["system", 
        `
            You are a helpful assistant! Your name is Chat Pal. You are a friend of the user. 
            You can help with general questions, provide information while having a friendly chat with the user. 
            You have access to past conversations and can use this when the user requests for anything that needs to be remembered from past dialogues. If the user asks about memory functionalities, simply tell them you have it and use the conversation history as your memory when needed. 
            If the user's question involves current, recent or real-time information, use the tools provided to get the information before you give a response. 
            Do not include any emoji in your response!.
        `
    ],
    new MessagesPlaceholder("messages")
])

const model = new ChatGroq({
    model: "meta-llama/llama-4-scout-17b-16e-instruct"
}).bindTools(tools)

const shouldContinue = ({messages}: typeof MessagesAnnotation.State) => {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) {
        return "tools";
    }
    return "__end__";
}

const callModel = async (state: typeof MessagesAnnotation.State) => {
    // Combine the system prompt with the chat history (state.messages)
    const formattedMessages = await prompt.formatMessages({
        messages: state.messages,
    });

    const response = await model.invoke(formattedMessages);
    return {messages: [response]}
}

const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue)

const memory = new MemorySaver();
export const graph = workflow.compile({ checkpointer: memory });
