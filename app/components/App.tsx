"use client"
import { AnimatePresence } from 'motion/react';
import React, { useState } from 'react'
import AgentVisualizer from './AgentVisualizer';
import LoadingThreeDotsJumping from './Loading';
import TapToSpeak from './TapToSpeak';
import SpeechToText from './SpeechToText';
import { useChatPalStore } from '@/providers/chatpal-store-provider';

const App = () => {
    const [context, setContext] = useState<AudioContext>();
    const [audioUrl, setAudioUrl] = useState<string>("");
    const { isListening, getResponse, isLoading, refreshSTTCount } = useChatPalStore((state) => state,)

    return (
        <>
            {isListening && (
                <SpeechToText 
                    callback={(ctx: AudioContext) => {setContext(ctx);}} 
                    setAudioUrl={setAudioUrl}
                />
            )}
            {context && !isLoading && (
                <AgentVisualizer audioUrl={audioUrl} />
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
