import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatGroq} from "@langchain/groq";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const tools = [new DuckDuckGoSearch({maxResults: 3, })];
const toolNode = new ToolNode(tools);

export const prompt = ChatPromptTemplate.fromMessages([
    ["system", 
        `
            You are a helpful assistant! Your name is Chat Pal. You are a friend of the user. You can help with general questions, provide information while having a friendly chat with the user. 
            If the user's question involves current, recent or real-time information, use the tools provided to get the information before you give a response. 
            Do not include any emoji in your response!.
        `
    ],
    new MessagesPlaceholder("messages")
])

// const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.0-flash"
// }).bindTools(tools)

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



// export const agent = await app.stream(inputs, {
//     ...config,
//     streamMode: "values",
// });


// const agent = createReactAgent({
//     llm,
//     tools: [tool],
//     checkpointSaver: agentCheckpointer,
//     prompt: prompt,
// });

// export const agentFinalState = await agent.invoke(
//     { messages: [new HumanMessage("what is the current weather in sf")] },
//     { configurable: { thread_id: "42" } },
// );

// console.log(
//     agentFinalState.messages[agentFinalState.messages.length - 1].content,
// );