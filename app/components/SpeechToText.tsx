"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";
import { useNowPlaying } from "react-nowplaying";
import { useToast } from "@/hooks/use-toast";

type Props = {
  caption: string | undefined;
  setCaption: React.Dispatch<React.SetStateAction<string | undefined>>;
  isListening: boolean;
  getResponse: boolean;
  setGetResponse: React.Dispatch<React.SetStateAction<boolean>>;
  callback: React.Dispatch<React.SetStateAction<any>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
};

// const App: React.FC<Props> = ({caption, setCaption}) => {
const SpeechToText: ({caption, setCaption}: Props) => JSX.Element = ({caption, setCaption, isListening, getResponse, setGetResponse, callback, setIsLoading, setIsListening}) => {
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState, stopMicrophone } =
    useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();
  const { toast } = useToast();
  const { stop: stopAudio, play: playAudio, player } = useNowPlaying();

  useEffect(() => {
    if (!isListening) {
      stopMicrophone();
    }
  }, [isListening])

  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close. 
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      console.log("thisCaption: ", thisCaption);
      if (thisCaption !== "") {
        console.log('thisCaption !== ""', thisCaption);
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setGetResponse(!getResponse);
          setTimeout(() => setCaption(undefined), 3000);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);


  const sendText = useCallback(
    async () => {
      callback(new (window.AudioContext || window.webkitAudioContext)());
      
      if (!caption || caption === "") {
      setGetResponse(false);
      return toast({
          variant: 'destructive',
          description: "Uh oh! Kindly make a request",
      })
      } 
      setIsListening(false)
      setIsLoading(true);
      stopAudio();
      
      try {
      const model = "aura-asteria-en";

      const response = await fetch(`/api/chat?model=${model}`, {
          cache: "no-store",
          method: "POST",
          body: JSON.stringify({ caption }),
      });

      stopAudio();
      const response_blob = await response.blob()

      setIsLoading(false);
      setCaption("");
      
      playAudio(response_blob, "audio/mp3");
      player?.addEventListener("ended", (event: Event) => {
          console.log("Audio has finished playing");
          setGetResponse(false);
          });
      } catch (error: any) {
          console.error("The get response error: ", error)
      toast({
          variant: 'destructive',
          title: `Uh oh! Something went wrong. Error ${error?.response?.status}`,
          description: `${error?.response?.data}`,
      })
      } finally {
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caption],
    );

    useEffect(() => {
      if (getResponse) {
        sendText();
      }
    }, [getResponse])


  return (
    <>
      <div className="flex h-full antialiased">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col flex-auto h-full">
            {/* height 100% minus 8rem */}
            <div className="relative w-full h-full">
              {microphone && <Visualizer microphone={microphone} />}
              <div className="absolute bottom-[8rem]  inset-x-0 max-w-4xl mx-auto text-center">
                {caption && <span className="bg-black/70 p-8">{caption}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpeechToText;
