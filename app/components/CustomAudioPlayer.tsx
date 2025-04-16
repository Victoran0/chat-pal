'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface CustomAudioPlayerProps {
    audioSrc: string;
    className?: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ audioSrc, className = '' }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playError, setPlayError] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            if (progressBarRef.current) {
                progressBarRef.current.max = String(audio.duration);
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (progressBarRef.current) {
                progressBarRef.current.value = String(audio.currentTime);
            }
        };

        const handleAudioEnd = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (progressBarRef.current) {
                progressBarRef.current.value = '0';
            }
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleAudioEnd);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleAudioEnd);
            if (audioSrc?.startsWith('blob:')) {
                URL.revokeObjectURL(audioSrc);
                console.log('Audio src cleaned');
            }
        };
    }, [audioSrc]);

    const togglePlayPause = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        setPlayError(false); // reset error state

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            return;
        }

        try {
            await audio.play();
            setIsPlaying(true);
        } catch (err) {
            console.warn("Initial play failed, trying to resume AudioContext", err);

            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const context = new AudioContext();

                if (context.state === 'suspended') {
                    await context.resume();
                    await audio.play();
                    setIsPlaying(true);
                }
            } catch (contextError) {
                console.error("Failed to resume audio context or play:", contextError);
                setIsPlaying(false);
                setPlayError(true); // notify user if needed
            }
        }
    };

    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newTime = Number(event.target.value);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (timeInSeconds: number): string => {
        if (isNaN(timeInSeconds) || timeInSeconds === Infinity) {
            return '00:00';
        }
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className={`text-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto flex flex-col items-center space-y-4 ${className}`}>
            <audio
                ref={audioRef}
                src={audioSrc}
                preload="auto"
                crossOrigin="anonymous"
            />

            <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition duration-150 ease-in-out shadow-md"
            >
                {isPlaying ? <Pause size={96} /> : <Play size={96} />}
            </button>

            {playError && (
                <div className="text-sm text-red-400">
                    Playback failed. Please tap again or check your audio settings.
                </div>
            )}

            <div className="w-full flex items-center space-x-3">
                <span className="text-xs font-mono w-12 text-right">{formatTime(currentTime)}</span>

                <input
                    type="range"
                    ref={progressBarRef}
                    value={currentTime}
                    max={duration || 0}
                    onChange={handleSeek}
                    aria-label="Audio progress"
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                />

                <span className="text-xs font-mono w-12 text-left">{formatTime(duration)}</span>
            </div>
        </div>
    );
};

export default CustomAudioPlayer;
