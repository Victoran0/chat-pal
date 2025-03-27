"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import App from "./components/App";
import { XIcon } from "./components/icons/XIcon";
import { LinkedInIcon } from "./components/icons/LinkedInIcon";
import { FacebookIcon } from "./components/icons/FacebookIcon";
import { useNowPlaying } from "react-nowplaying";
import {AnimatePresence, motion} from 'motion/react'
import GitHubButton from "react-github-btn";
import TapToSpeak from "./components/TapToSpeak";
import LoadingThreeDotsJumping from "./components/Loading";
import AgentVisualizer from "./components/AgentVisualizer";

const Home = () => {
  const [isListening, setIsListening] = useState(false);
  const [caption, setCaption] = useState<string | undefined>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [getResponse, setGetResponse] = useState(false);
  const { stop: stopAudio, play: playAudio, player,   } = useNowPlaying();
  const [context, setContext] = useState<AudioContext>();
  const callback = (ctx: AudioContext) => {setContext(ctx)}

  const sendText = useCallback(
    async () => {
      callback(new (window.AudioContext || window.webkitAudioContext)());
      setIsListening(false);
      if (!caption || caption === "") {
        setGetResponse(false);
        return alert("Kindly make a request before asking Chat Pal")
      } 
      stopAudio();
      
      try {
        const model = "aura-asteria-en";

        const response = await fetch(`/api/chat?model=${model}`, {
          cache: "no-store",
          method: "POST",
          body: JSON.stringify({ caption }),
        });

        stopAudio();
        setCaption("");
        const response_blob = await response.blob()
        await playAudio(response_blob, "audio/mp3");
        console.log("the response blob: ", response_blob)
        const audioUrl = URL.createObjectURL(response_blob);
        // setAudioUrl(audioUrl);
        console.log("the audio url: ", audioUrl)
      } catch (error) {
        console.error("The get response error: ", error)
      } finally {
        setGetResponse(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caption],
  );

  useEffect(() => {
    if (getResponse) {
      setIsListening(false)
      sendText();
    }
  }, [getResponse])

  const get_response = async () => {
    if (!caption || caption === "") {
      return alert("Kindly make a request before asking Chat Pal")
    } 
    setIsListening(false);
    stopAudio();
    try {
      const model = "aura-asteria-en";

      const response = await fetch(`/api/chat?model=${model}`, {
        cache: "no-store",
        method: "POST",
        body: JSON.stringify({ caption }),
      });

      console.log("the response: ", response)

      // stopAudio();
      setCaption("");
      const response_blob = await response.blob()
      // playAudio(response_blob, "audio/mp3");
      const audioUrl = URL.createObjectURL(response_blob);
      // console.log("the audio url: ", audioUrl)
      setAudioUrl(audioUrl);

    } catch (error) {
      console.error("The get response error: ", error)
    } finally {
    }
  }

  return (
    <>
      <div className="h-full overflow-hidden">
        {/* height 4rem */}
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px] h-[4rem] flex items-center">
          <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <a className="flex items-center" href="/">
                <h1
                  className="w-auto h-8 max-w-[12.5rem] font-favorit font-[900] sm:max-w-none bg-gradient-to-r from-[#149AFB] via-[#13EF93] bg-[length:200%_200%] to-[#149AFB] bg-clip-text text-transparent animate-gradient text-[22px]"
                >
                  Chat Pal
                </h1>
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="mt-1">
                <GitHubButton
                  href="https://github.com/Victoran0/chat-pal"
                  data-color-scheme="no-preference: light; light: light; dark: light;"
                  data-size="large"
                  data-show-count="true"
                  aria-label="Star Victoran0/chat-pal on GitHub"
                >
                  Star
                </GitHubButton>
              </span>
              {/* <span className="mt-1"> */}
                {/* <button
                  type="button"
                  // disabled={isListening === false}
                  className="disabled:opacity-20 hover:opacity-75 active:opacity-20 duration-100 transition-all"
                  onClick={() => get_response()}
                  // onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  //   sendText(event);
                  // }}
                  // onClick={() => playAud()}
                >
                  {loading ? "Generating..." : "Ask Chat Pal"}
                </button>
              </span> */}

              {/* <span className="gradient-shadow bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded">
                <button
                  className="text-xs bg-black text-white rounded m-px px-8 py-2 font-semibold"
                  type="button"
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? "Disable Speech" : "Enable Speech"}
                </button>
              </span> */}
              {/* <div>
                {audioUrl && (
                  <audio id="myAudio" controls autoPlay src={audioUrl}></audio>
                )}
              </div> */}
            </div>
          </header>
        </div>

        {/* height 100% minus 8rem */}
        <main className="mx-auto px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem] flex justify-center items-center">
          {isListening && <App caption={caption} setCaption={setCaption} isListening={isListening} getResponse={getResponse} setGetResponse={setGetResponse} />}
          <AnimatePresence>
            {(!isListening && !getResponse) && (
              <TapToSpeak isListening={isListening} setIsListening={setIsListening} />
            )}
          </AnimatePresence>
          {getResponse && <LoadingThreeDotsJumping />}
          {context && player && (
              <AgentVisualizer source={player} context={context} />
            )}
        </main>
        {/* <div className="w-40 h-40 bg-gradient-to-r from-[#149AFB] via-[#13EF93] bg-[length:200%_200%] to-[#149AFB] blur-3xl rounded-full animate-gradient"></div> */}

        {/* height 4rem */}
        <div className="bg-black/80 h-[4rem] flex items-center absolute w-full">
          <footer className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-center gap-4 md:text-xl font-inter text-[#8a8a8e]">
            <span className="text-base text-[#4e4e52]">share it</span>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://twitter.com/intent/tweet?text=%F0%9F%94%A5%F0%9F%8E%89%20Check%20out%20this%20awesome%20%23AI%20demo%20by%20%40Deepgram%20and%20%40lukeocodes%0A%0A%20https%3A//github.com/Victoran0/chat-pal",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              aria-label="share on twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <XIcon className="mb-1" />
            </a>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://www.linkedin.com/shareArticle?mini=true&url=https%3A//github.com/Victoran0/chat-pal review on my website reviews",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              aria-label="share on Linkedin"
            >
              <LinkedInIcon className="mb-1" />
            </a>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://www.facebook.com/sharer/sharer.php?u=https%3A//github.com/Victoran0/chat-pal",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              target="_blank"
              aria-label="share on Facebook"
              rel="noopener noreferrer"
            >
              <FacebookIcon className="mb-1" />
            </a>
            <div className="border-l border-[#4e4e52] w-px h-7">&nbsp;</div>
            <a
              className="text-base font-semibold"
              href="https://github.com/Victoran0/chat-pal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built by: Victor Oluwadare
            </a>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Home;
