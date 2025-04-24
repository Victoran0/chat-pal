"use client"
import React, { useEffect } from 'react'
import { useChatPalStore } from "@/providers/chatpal-store-provider";
import { useToast } from '@/hooks/use-toast';

const TextToSpeech = () => {
    const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
    const {setRefreshSTTCount, toggleBoolean, setChatPalResponse} = useChatPalStore((state) => state,);
    const {toast} = useToast();

    useEffect(() => {
        const handlePageHide = () => {
            stopSpeech();
        };

        window.addEventListener("pagehide", handlePageHide);

        return () => {
            window.removeEventListener("pagehide", handlePageHide);
            stopSpeech();
        };
    }, []);


    function textToSpeech(chatPalResponse: string) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;

        // If already speaking, cancel
        if (synth.speaking) {
            console.warn('speechSynthesis is already speaking. Cancelling...');
            toast({
                variant: 'destructive',
                title: `Uh oh!`,
                description: `Currently speaking. Cancelling...`,
            })
            // setSpeakingIndex(-1)
            synth.cancel();
            return; 
        }

        const speakNow = () => {
            const utterThis = new SpeechSynthesisUtterance(chatPalResponse);

            const selectedVoice =
            synth.getVoices().find((voice) => voice.name === "Microsoft Aria Online (Natural) - English (United States)") ||
            voices.find((voice) => voice.default === true) ||
            voices[0];
            console.log("Zira: ", synth.getVoices().find((voice) => voice.voiceURI === "Microsoft Zira - English (United States)"))

            if (selectedVoice) {
                utterThis.voice = selectedVoice;
            }

            utterThis.pitch = 1;
            utterThis.rate = 1;

            utterThis.onend = () => {
                // setSpeakingIndex(-1)
                toggleBoolean("getResponse", false);
                setRefreshSTTCount();
                setChatPalResponse("");
                console.log('Speech finished');
            };
            utterThis.onstart = () => {
                toast({
                    variant: 'default',
                    title: `Listen Up!`,
                    description: `Chat Pal is speaking...`,
                })
                // setSpeakingIndex(index)
            }
            utterThis.onerror = (e: any) => {
                console.log('Speech error', e)
                if (e.error !== "interrupted") {
                    toast({
                        variant: 'destructive',
                        title: `Uh oh!`,
                        description: `Something went wrong, try again later...`,
                    })
                }
            };

            synth.speak(utterThis);
        };

        // console.log("Available voices: ", synth.getVoices())
        const loadVoices = () => {
            setVoices(synth.getVoices().sort((a, b) => a.name.localeCompare(b.name)));
            console.log("Available voices: ", voices);
        };

        if (voices.length === 0) {
            // Some browsers load voices asynchronously
            synth.onvoiceschanged = loadVoices;
        }

        speakNow();
    }

    function stopSpeech() {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        if (synth.speaking) {
            // setSpeakingIndex(-1)
            synth.cancel();
        }
    }

    return {
        textToSpeech,
        stopSpeech
    }
}

export default TextToSpeech
