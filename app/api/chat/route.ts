import axios from "axios";
import { createClient } from "@deepgram/sdk";
import { NextRequest, NextResponse } from "next/server";

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

  try {
    const res = await axios.post(`${process.env.BASE_URL}/chat/`, 
        {body: caption}
    )
    text = await res.data.agent_response
    console.log("The backend response: ", text)
    // return new Response("got it", {status: 200})
  } catch (error: any) {
    console.error("The backend error: ", error)
    return new Response(JSON.stringify(error), {status: error?.response?.status})
  }

  try {
    // gotta use the request object to invalidate the cache every request :vomit:
    // const url = request.url;
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

    const model = request.nextUrl.searchParams.get("model") ?? "aura-asteria-en";
    console.log("the text: ", text)

    console.log(model, text);

    const result = await deepgram.speak.request({text: text}, { model });
    const stream = await result.getStream();
    const headers = await result.getHeaders();

    const response = new NextResponse(stream, { headers });
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set(
      "Cache-Control",
      "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Expires", "0");

    return response;
  } catch (error: any) {
      console.error("The backend error: ", error)
      return new Response(JSON.stringify(error), {status: error?.response?.status})
  }

}
