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
            You are connected to a speech-to-text (STT) and text-to-speech (TTS) system. This means you can understand spoken input via STT and your responses are spoken aloud through a TTS service. If the user asks whether you can hear or speak, respond affirmatively, as you can "hear" through STT and "speak" through TTS.
            When the user requests features or interactions involving speaking or listening—such as conversations, dictation, pronunciation, or verbal instructions—respond naturally as if you are actively engaging in spoken dialogue. Fulfill their requests in text, and trust that the TTS system will vocalize your responses. Always communicate as though you are part of a fluid, real-time verbal interaction. As a result of this, you can not include any emoji in your response.
            When asked about your capabilities, history, existence or anything related to your being, simply say you are a friend and you are here to help the user.
            When asked about who created you, say you were created by Victor also known as Victorano, a passionate software engineer and AI enthusiast.
        `
    ],
    new MessagesPlaceholder("messages")
])

const model = new ChatGroq({
    model: "meta-llama/llama-4-scout-17b-16e-instruct"
}).bindTools(tools)

const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    console.log("The last message is: ", lastMessage);
    // Check structured tool calls
    if (lastMessage.tool_calls?.length) {
        console.log("Actual tool call detected")
        return "tools";
    }

    // Fallback: check if content contains a tool function string
    if (typeof lastMessage.content === "string" && lastMessage.content.includes("<function=")) {
        console.log("manual tool call detected")
        return "manual_tool_handler";
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

const manualToolHandler = async (state: typeof MessagesAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    const content = lastMessage.content as string;

    const match = content.match(/<function=(.*?)>(\{.*\})/);
    console.log("The regex match is: ", match);
    if (!match) return { messages: [] };

    const [, functionName, rawInput] = match;
    let toolInput;

    try {
        toolInput = JSON.parse(rawInput);
    } catch (err) {
        console.error("Failed to parse tool input:", err);
        return { messages: [new AIMessage({ content: "Sorry, I couldn't process that request." })] };
    }

    const tool = tools.find(t => t.name === functionName);
    if (!tool) {
        return { messages: [new AIMessage({ content: `Tool "${functionName}" not found.` })] };
    }

    let result;
    try {
        result = await tool.invoke(toolInput);
    } catch (err) {
        console.error("Tool execution error:", err);
        return { messages: [new AIMessage({ content: "There was an error running the tool." })] };
    }

    // Return the tool result as a message
    const toolResponse = new AIMessage({ content: result });

    return { messages: [toolResponse] };
}


const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addNode("manual_tool_handler", manualToolHandler)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addEdge("manual_tool_handler", "agent")
    .addConditionalEdges("agent", shouldContinue)

const memory = new MemorySaver();
export const graph = workflow.compile({ checkpointer: memory });
