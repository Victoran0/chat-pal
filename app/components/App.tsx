"use client"
import { AnimatePresence } from 'motion/react';
import React, { useState } from 'react'
import LoadingThreeDotsJumping from './Loading';
import TapToSpeak from './TapToSpeak';
import SpeechToText from './SpeechToText';
import { useChatPalStore } from '@/providers/chatpal-store-provider';
import RippleLoader from './RippleLoader';

const App = () => {
    const [context, setContext] = useState<AudioContext>();
    const [audioUrl, setAudioUrl] = useState<string>("");
    const { isListening, getResponse, isLoading, refreshSTTCount, chatPalResponse, isConnecting } = useChatPalStore((state) => state,)

    return (
        <>
            {isListening &&  (
                <SpeechToText 
                    callback={(ctx: AudioContext) => {setContext(ctx);}} 
                    setAudioUrl={setAudioUrl}
                    key={`speech-to-text-${refreshSTTCount}`}
                />
            )}
            {chatPalResponse !== "" && !isLoading && (
                <RippleLoader />
            )}
            <AnimatePresence>
                {!isListening && !getResponse && (
                    <TapToSpeak />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {(getResponse && isLoading) && (
                    <LoadingThreeDotsJumping />
                )}
            </AnimatePresence>
        </>
    )
}

export default App
