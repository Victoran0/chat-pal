import { Inter } from "next/font/google";
import classNames from "classnames";
import localFont from "next/font/local";

import { DeepgramContextProvider } from "./context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "./context/MicrophoneContextProvider";

import "./globals.css";
import "./button.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";

import { ChatPalStoreProvider } from "@/providers/chatpal-store-provider";

const inter = Inter({ subsets: ["latin"] });
const favorit = localFont({
  src: "./fonts/ABCFavorit-Bold.woff2",
  variable: "--font-favorit",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
  // maximumScale: 1, hitting accessability
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aura-tts-demo.deepgram.com"),
  title: "Chat Pal",
  description: `Experience seamless, real-time speech-to-speech conversations with an AI assistant. Engage in natural dialogues, ask questions, and receive instant spoken responses, creating a truly immersive and interactive experience.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-dvh">
      <body
        className={`h-full dark ${classNames(
          favorit.variable,
          inter.className
        )}`}
      >
        <MicrophoneContextProvider>
          <DeepgramContextProvider>
            <ChatPalStoreProvider>
              {children}
            </ChatPalStoreProvider>
              <Toaster />
            </DeepgramContextProvider>
        </MicrophoneContextProvider>
      </body>
    </html>
  );
}
