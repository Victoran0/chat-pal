"use client"
import { AnimatePresence } from 'motion/react';
import React, { useState } from 'react'
import { useNowPlaying } from 'react-nowplaying';
import AgentVisualizer from './AgentVisualizer';
import LoadingThreeDotsJumping from './Loading';
import TapToSpeak from './TapToSpeak';
import SpeechToText from './SpeechToText';

const App = () => {
    const [isListening, setIsListening] = useState(false);
    const [caption, setCaption] = useState<string | undefined>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [getResponse, setGetResponse] = useState(false);
    const { player } = useNowPlaying();
    const [context, setContext] = useState<AudioContext>();

    return (
        <>
            {isListening && (
                <SpeechToText 
                    caption={caption}
                    setCaption={setCaption} 
                    isListening={isListening} 
                    getResponse={getResponse} 
                    setGetResponse={setGetResponse} 
                    callback={(ctx: AudioContext) => {setContext(ctx);}} 
                    setIsLoading={setIsLoading} 
                    setIsListening={setIsListening} 
                />
            )}
            <AnimatePresence>
            {(!isListening && !getResponse) && (
                <TapToSpeak isListening={isListening} setIsListening={setIsListening} />
            )}
            </AnimatePresence>
            {((context && player) && !isLoading ) && (
                <AgentVisualizer source={player} context={context} />
            )}
            <AnimatePresence>
            {(getResponse && isLoading) && (
                <LoadingThreeDotsJumping />
            )}
            </AnimatePresence>
        </>
    )
}

export default App
