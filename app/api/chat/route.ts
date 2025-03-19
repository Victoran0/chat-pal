import axios from "axios";

export async function POST(req: Request) {
    const {body} = await req.json()
    console.log("the request: ", body)
    try {
        const response = await axios.post(`${process.env.BASE_URL}/chat/`, 
            {body: body}
        )
        const data = await response.data
        console.log("The backend response: ", data)
    } catch (error) {
        console.error("The backend error: ", error)
        return new Response(JSON.stringify(error), {status: 400})
    }
    return new Response("successfully received", {status: 200})
}