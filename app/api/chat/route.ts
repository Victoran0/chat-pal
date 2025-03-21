// import axios from "axios";
// import { createClient } from "@deepgram/sdk";
// import { NextRequest, NextResponse } from "next/server";

// export const revalidate = 0;

// export async function POST(request: NextRequest) {
    // const {body} = await req.json()
    // console.log("the request: ", body)
    // try {
    //     const response = await axios.post(`${process.env.BASE_URL}/chat/`, 
    //         {body: body}
    //     )
    //     const data = await response.data
    //     console.log("The backend response: ", data)
    // } catch (error) {
    //     console.error("The backend error: ", error)
    //     return new Response(JSON.stringify(error), {status: 400})
    // }

    // gotta use the request object to invalidate the cache every request :vomit:
//     const url = request.url;
//     const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

//     const message = await request.json();

//     console.log(message);

//     const result = await deepgram.speak.request(message);
//     const stream = await result.getStream();
//     console.log("the stream: ", stream)
//     const headers = await result.getHeaders();

//     const response = new NextResponse(stream, { headers });
//     response.headers.set("Surrogate-Control", "no-store");
//     response.headers.set(
//         "Cache-Control",
//         "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate",
//     );
//     response.headers.set("Expires", "0");

//     return response;
// };

import { createClient } from "@deepgram/sdk";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

/**
 * Return a stream from the API
 * @param {NextRequest} req - The HTTP request
 * @returns {Promise<NextResponse>} A NextResponse with the streamable response
 */
export async function POST(request: NextRequest) {
  // gotta use the request object to invalidate the cache every request :vomit:
  const url = request.url;
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  const model = request.nextUrl.searchParams.get("model") ?? "aura-asteria-en";
  const message = await request.json();

  console.log(model, message);

  const result = await deepgram.speak.request(message, { model });
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
}
