import axios from "axios";
import { createClient } from "@deepgram/sdk";
import { NextRequest, NextResponse } from "next/server";
import { graph } from "./agent";
import { HumanMessage } from "@langchain/core/messages";

export const revalidate = 0;

/**
 * Return a stream from the API
 * @param {NextRequest} req - The HTTP request
 * @returns {Promise<NextResponse>} A NextResponse with the streamable response
 */

export async function POST(request: NextRequest) {
  const {caption} = await request.json();
  console.log("user;s request: ", caption)
  let text = ""

  // store thread id in the local storage and check if it exists, else create a new one for each conversation, it can last for up to 30 days
  try {
    const agentFinalState = await graph.invoke(
      { messages: [new HumanMessage(caption)] },
      { configurable: { thread_id: "conversation-42" } },
    );
    console.log(
      agentFinalState.messages,
    );
    text = agentFinalState.messages[agentFinalState.messages.length - 1].content.toString()
    // console.log("The AI AGENT response: ", text)

    return new Response(JSON.stringify(text), {status: 200})

  } catch (error: any) {
    console.error("The AI AGENT error: ", error)
    return new Response(JSON.stringify(error?.response), {status: 500})
  }

  // try {
  //   // gotta use the request object to invalidate the cache every request :vomit:
  //   // const url = request.url;
  //   const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  //   const model = request.nextUrl.searchParams.get("model") ?? "aura-asteria-en";

  //   console.log("model: ", model, "\nThe AI AGENT response: ", text);

  //   const result = await deepgram.speak.request({text: text}, { model });
  //   const stream = await result.getStream();
  //   const headers = await result.getHeaders();

  //   const response = new NextResponse(stream, { headers });
  //   response.headers.set("Surrogate-Control", "no-store");
  //   response.headers.set(
  //     "Cache-Control",
  //     "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate",
  //   );
  //   response.headers.set("Expires", "0");

  //   return response;
  // } catch (error: any) {
  //     console.error("The backend error: ", error)
  //     return new Response(JSON.stringify(error?.response), {status: 500})
  // }

}
