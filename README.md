# Chat Pal

The purpose of this demo is to showcase how you can build a NextJS + langchain + langgraph + Web Speech API SpeechSynthesis + Groq speech to speech AI Assistant using [Deepgram](https://deepgram.com/).

## Demo features

Capture streaming audio using [Deepgram Streaming Speech to Text](https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio).  
Convert text to speech [Deepgram Streaming Text to Speech](https://developers.deepgram.com/docs/tts-rest)

## What is Chat Pal?

Chat Pal: Enjoy fluid, voice-driven conversations with an AI companion. Ask questions, explore topics, and receive spoken answers in real-time, creating a dynamic and engaging conversational experience.  
This speech-to-speech AI assistant offers a user-friendly way to interact with AI enhanced with the Langgraph MemorySaver, making information and assistance accessible through simple voice commands.

## Quickstart

### Manual

Follow these steps to get started with this starter application.

#### Clone the repository

Go to GitHub and [clone the repository](https://github.com/victoran0/chat-pal).

#### Install dependencies

Install the project dependencies.

```bash
npm install
```

#### Edit the config file

Copy the code from `sample.env.local` and create a new file called `.env.local`.

```bash
DEEPGRAM_API_KEY=YOUR-DG-API-KEY
GROQ_API_KEY=YOUR-GROQ-API-KEY
```

For `DEEPGRAM_API_KEY` paste in the key you generated in the [Deepgram console](https://console.deepgram.com/).

For `GROQ_API_KEY` paste in the key you generated in the [Groq console](https://console.groq.com/).

#### Run the application

Once running, you can [access the application in your browser](http://localhost:3000).

```bash
npm run dev
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Security Policy](./SECURITY.md) details the procedure for contacting Deepgram.

## Getting Help

I will love to hear from you so if you have questions, comments or find a bug in the project, let me know! You can:

- [Open an issue in this repository](https://github.com/victoran0/chat-pal/issues)

## Author

Victor Oluwadare

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.
