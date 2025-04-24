"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
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
import { useToast } from "@/hooks/use-toast";
import { useChatPalStore } from "@/providers/chatpal-store-provider";
import Connecting from "./Connecting";

type Props = {
  callback: React.Dispatch<React.SetStateAction<any>>;
  setAudioUrl: React.Dispatch<React.SetStateAction<string>>;
};

// const App: React.FC<Props> = ({caption, setCaption}) => {
const SpeechToText: ({}: Props) => JSX.Element = ({ callback, setAudioUrl }) => {
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState } = useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();
  const { toast } = useToast();
  const [caption, setCaption] = useState<string>();
  const {toggleBoolean, getResponse, setRefreshSTTCount, setChatPalResponse, isConnecting} = useChatPalStore((state) => state,)

  useEffect(() => {
    // The same value that renders the component
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      toggleBoolean("isConnecting", true);
      const isConnectingTimeout = setTimeout(() => {
        toast({
        variant: "default",
        title: "Connecting...", 
        description: "Please wait while we connect you to Chat Pal.",
      })}, 750)
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      }).then(() => {
        toggleBoolean("isConnecting", false);
        clearTimeout(isConnectingTimeout);
        toast({
          variant: "default",
          title: "Connected!", 
          description: "You are now connected to Chat Pal.",
        });
      })
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
      
      toggleBoolean("visualizeHuman", true)
      console.log("thisCaption: ", thisCaption);
      if (thisCaption !== "") {
        console.log('thisCaption !== ""', thisCaption);
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          toggleBoolean("getResponse", true)
          setTimeout(() => setCaption(undefined), 1000);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === 'OPEN') {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
      console.log("Connected to Deepgram");
    }

    return () => {
      // prettier-ignore
      console.log("Disconnected from Deepgram");
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
      connectionState === "OPEN"
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
      // callback(new (window.AudioContext || window.webkitAudioContext)());
      
      if (!caption || caption === "") {
        setRefreshSTTCount()
        toggleBoolean("getResponse", false)
        toggleBoolean("visualizeHuman", false)
        toggleBoolean("isListening", false)
        setRefreshSTTCount();
        return toast({
            variant: 'destructive',
            description: "Uh oh! Kindly make a request",
        })
      } 
      toggleBoolean("isListening", false)
      toggleBoolean("isLoading", true)
      
      try {
        const model = "aura-asteria-en";

        const response = await fetch(`/api/chat?model=${model}`, {
            cache: "no-store",
            method: "POST",
            body: JSON.stringify({ caption }),
        });
        console.log("The response: ", response)

        if (!response.ok) {
          setRefreshSTTCount()
          console.error("Network response was not ok");
          toggleBoolean("isLoading", false);
          toggleBoolean("visualizeHuman", false);
          toggleBoolean("getResponse", false);
          setCaption("");
          setRefreshSTTCount();
          return toast({
            variant: 'destructive',
            title: `Uh oh! Something went wrong. Error ${response?.status}`,
            description: `${response?.statusText}`,
          })
        }

        // const response_blob = await response.blob()
        const response_text = await response.json();
        console.log("The response text: ", response_text)

        toggleBoolean("isLoading", false);
        // const blobUrl = URL.createObjectURL(response_blob);
        // setAudioUrl(blobUrl);
        setChatPalResponse(response_text);
        // textToSpeech(response_text);
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
    }, [ getResponse ]);
  


  if (isConnecting) return <Connecting />

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
