"use client";

import { XIcon } from "./components/icons/XIcon";
import { LinkedInIcon } from "./components/icons/LinkedInIcon";
import { FacebookIcon } from "./components/icons/FacebookIcon";
import GitHubButton from "react-github-btn";
import App from "./components/App";

const Home = () => {



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
            </div>
          </header>
        </div>

        {/* height 100% minus 8rem */}
        <main className="mx-auto px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem] flex justify-center items-center">
          <App />
        </main>

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
