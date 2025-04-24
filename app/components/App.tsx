"use client"
import { AnimatePresence } from 'motion/react';
import React, { useState } from 'react'
import LoadingThreeDotsJumping from './Loading';
import TapToSpeak from './TapToSpeak';
import SpeechToText from './SpeechToText';
import { useChatPalStore } from '@/providers/chatpal-store-provider';
import RippleLoader from './RippleLoader';
import { Play } from 'lucide-react';
import UseTextToSpeech from './TextToSpeech';

const App = () => {
    const [context, setContext] = useState<AudioContext>();
    const [audioUrl, setAudioUrl] = useState<string>("");
    const { isListening, getResponse, isLoading, refreshSTTCount, chatPalResponse, toggleBoolean, isSpeaking } = useChatPalStore((state) => state,)
    const {textToSpeech} = UseTextToSpeech()

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
                isSpeaking ? <RippleLoader /> : (
                    <div className="flex items-center font-[600] flex-col gap-3 justify-center">
                        <button 
                            type='button' 
                            title='Listen to Chat Pak Response'
                            onClick={() => {
                                textToSpeech(chatPalResponse)
                                toggleBoolean("isSpeaking", true)  
                            }}
                        >
                            <Play size={100} fill='#13EF93' color='#13EF93' className='sm:max-w-none bg-gradient-to-r from-[#149AFB] via-[#13EF93] bg-[length:200%_200%] to-[#149AFB] bg-clip-text text-transparent hover:scale-110 transition-all duration-150 active:scale-50 animate-gradient' />
                        </button>
                        <p className='sm:max-w-none bg-gradient-to-r from-[#149AFB] via-[#13EF93] bg-[length:200%_200%] to-[#149AFB] bg-clip-text text-transparent animate-gradient'>
                            press play to listen
                        </p>
                    </div>
                )
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
