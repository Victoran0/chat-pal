"use client";

import { BaseSyntheticEvent, MouseEvent, useCallback, useState } from "react";
import Image from "next/image";
import App from "./components/App";
import { XIcon } from "./components/icons/XIcon";
import { LinkedInIcon } from "./components/icons/LinkedInIcon";
import { FacebookIcon } from "./components/icons/FacebookIcon";
import { useNowPlaying } from "react-nowplaying";

const Home = () => {
  const [isListening, setIsListening] = useState(false);
  const [caption, setCaption] = useState<string | undefined>(
    "Powered by Deepgram"
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { stop: stopAudio, play: playAudio  } = useNowPlaying();
  const [context, setContext] = useState<AudioContext>();
  const callback = (ctx: AudioContext) => {setContext(ctx)}
  const [text, setText] = useState<string>("my name is paul");

  const playAud = () => {
    stopAudio()
    // get your audio blob
    playAudio("/song.mp3", "audio/wav");
    console.log("now playing")
  };

  const sendText = useCallback(
    async (event: BaseSyntheticEvent) => {
      // callback(new (window.AudioContext || window.webkitAudioContext)());

      stopAudio();

      const model = "aura-asteria-en";

      const response = await fetch(`/api/chat?model=${model}`, {
        cache: "no-store",
        method: "POST",
        body: JSON.stringify({ text }),
      });

      // stopAudio();
      setText("");
      const response_blob = await response.blob()
      playAudio(response_blob, "audio/mp3");
      // console.log("the response blob: ", response_blob)
      // const audioUrl = URL.createObjectURL(response_blob);
      // console.log("the audio url: ", audioUrl)
      // setAudioUrl(audioUrl);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const get_response = async () => {
    // if (caption === "Powered by Deepgram" || caption === "" || caption === undefined) {
    //   return alert("Kindly make a request before asking Chat Pal")
    // } 
    // setLoading(true);
    // setIsListening(false);
    // try {
    //   const response = await fetch(`/api/chat`, {
    //     cache: "no-store",
    //     method: "POST",
    //     body: JSON.stringify({caption}),
    //   });

    //   const arrayBuffer = await response.arrayBuffer();
    //   const blob = new Blob([arrayBuffer], { type: "audio/wav" });
    //   const audioUrl = URL.createObjectURL(blob);
    //   setAudioUrl(audioUrl);

    // } catch (error) {
    //   console.error("The get response error: ", error)
    // } finally {
    //   setLoading(false);
    // }
      stopAudio();

      const model = "aura-asteria-en";

      const response = await fetch(`/api/chat?model=${model}`, {
        cache: "no-store",
        method: "POST",
        body: JSON.stringify({ text }),
      });

      // stopAudio();
      setText("");
      const response_blob = await response.blob()
      // playAudio(response_blob, "audio/mp3");
      const audioUrl = URL.createObjectURL(response_blob);
      // console.log("the audio url: ", audioUrl)
      setAudioUrl(audioUrl);
  }

  return (
    <>
      <div className="h-full overflow-hidden">
        {/* height 4rem */}
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px] h-[4rem] flex items-center">
          <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <a className="flex items-center" href="/">
                <Image
                  className="w-auto h-8 max-w-[12.5rem] sm:max-w-none"
                  src="/deepgram.svg"
                  alt="Deepgram Logo"
                  width={0}
                  height={0}
                  priority
                />
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="mt-1">
                <button
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
              </span>

              <span className="gradient-shadow bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded">
                <button
                  className="text-xs bg-black text-white rounded m-px px-8 py-2 font-semibold"
                  type="button"
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? "Disable Speech" : "Enable Speech"}
                </button>
              </span>
              <div>
                {audioUrl && (
                  <audio id="myAudio" controls autoPlay src={audioUrl}></audio>
                )}
              </div>
            </div>
          </header>
        </div>

        {/* height 100% minus 8rem */}
        <main className="mx-auto px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
          {isListening && <App caption={caption} setCaption={setCaption} />}
        </main>

        {/* height 4rem */}
        <div className="bg-black/80 h-[4rem] flex items-center absolute w-full">
          <footer className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-center gap-4 md:text-xl font-inter text-[#8a8a8e]">
            <span className="text-base text-[#4e4e52]">share it</span>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://twitter.com/intent/tweet?text=%F0%9F%94%A5%F0%9F%8E%89%20Check%20out%20this%20awesome%20%23AI%20demo%20by%20%40Deepgram%20and%20%40lukeocodes%0A%0A%20https%3A//aura-tts-demo.deepgram.com",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              aria-label="share on twitter"
              target="_blank"
            >
              <XIcon className="mb-1" />
            </a>
            <a
              href="#"
              onClick={(e) => {
                window.open(
                  "https://www.linkedin.com/shareArticle?mini=true&url=https%3A//aura-tts-demo.deepgram.com&title=Excellent review on my website reviews",
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
                  "https://www.facebook.com/sharer/sharer.php?u=https%3A//aura-tts-demo.deepgram.com",
                  "",
                  "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
                );

                return e.preventDefault();
              }}
              target="_blank"
              aria-label="share on Facebook"
            >
              <FacebookIcon className="mb-1" />
            </a>
            <div className="border-l border-[#4e4e52] w-px h-7">&nbsp;</div>
            <a
              className="text-base font-semibold"
              href="https://deepgram.com/contact-us"
              target="_blank"
              rel="noopener noreferrer"
            >
              contact us
            </a>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Home;
