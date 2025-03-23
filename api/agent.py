from langchain_community.tools import DuckDuckGoSearchRun
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
import os
from dotenv import load_dotenv

load_dotenv()

model = ChatGoogleGenerativeAI(
    model='gemini-2.0-flash',
    api_key=os.environ["GEMINI_API_KEY"],
)

tools = [DuckDuckGoSearchRun()]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant! Your name is Chat Pal. You are a friend of the user, you are very conversational. You can help with general questions, provide information while having a friendly chat with the user. If the user's question involves current, recent or real-time information, use the tools provided to get the information before you give a response."),
    ("placeholder", "{messages}"),
    ("user", "Remember, you are a friend of the user"),
])

graph = create_react_agent(
    model,
    tools=tools,
    prompt=prompt,
    checkpointer=MemorySaver(),
)

config = {"configurable": {"thread_id": "thread-1"}}


def get_agent_response(request: str) -> str:
    """get the request's response from the AI Agent"""

    inputs = {"messages": [("user", request)]}

    for s in graph.stream(inputs, config, stream_mode="values"):
        message = s["messages"][-1]
        if isinstance(message, tuple):
            print(message)
        else:
            message.pretty_print()
    return s["messages"][-1].content
