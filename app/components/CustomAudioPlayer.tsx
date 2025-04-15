'use client'; // Add this directive for Client Component

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

// Define the props for the component
interface CustomAudioPlayerProps {
    /**
     * The source URL of the audio file.
     */
    audioSrc: string;
    /**
     * Optional Tailwind CSS classes for the container.
     */
    className?: string;
}

/**
 * A custom audio player component for Next.js/React applications.
 * Features a large play/pause button and a progress bar.
 *
 * @param {CustomAudioPlayerProps} props - The component props.
 * @returns {JSX.Element} The rendered audio player component.
 */
const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ audioSrc, className = '' }) => {
  // State variables
  const [isPlaying, setIsPlaying] = useState(false); // Tracks if audio is playing
  const [currentTime, setCurrentTime] = useState(0); // Current playback time in seconds
  const [duration, setDuration] = useState(0); // Total duration of the audio in seconds

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null); // Ref for the audio element
  const progressBarRef = useRef<HTMLInputElement>(null); // Ref for the progress bar input

  // Effect to handle audio loading and metadata
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
        // Event listener for when metadata (like duration) is loaded
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            if (progressBarRef.current) {
            progressBarRef.current.max = String(audio.duration); // Set max value for progress bar
            }
        };

        // Event listener for time updates during playback
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (progressBarRef.current) {
            progressBarRef.current.value = String(audio.currentTime); // Update progress bar value
            }
        };

        // Event listener for when the audio ends
        const handleAudioEnd = () => {
            setIsPlaying(false); // Set playing state to false
            setCurrentTime(0); // Reset current time
            if (progressBarRef.current) {
            progressBarRef.current.value = '0'; // Reset progress bar
            }
        };

        // Add event listeners
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleAudioEnd);

        // Cleanup function to remove event listeners
        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleAudioEnd);
        };
        }
    }, [audioSrc]); // Rerun effect if audioSrc changes

    // Function to toggle play/pause state
    const togglePlayPause = () => {
        if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Attempt to play, handle potential errors
            audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            // Optionally show an error message to the user
            setIsPlaying(false); // Ensure state reflects that playback failed
            });
        }
        setIsPlaying(!isPlaying); // Toggle the playing state
        }
    };

    // Function to handle seeking using the progress bar
    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
        const newTime = Number(event.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        }
    };

    // Function to format time (seconds) into MM:SS format
    const formatTime = (timeInSeconds: number): string => {
        if (isNaN(timeInSeconds) || timeInSeconds === Infinity) {
            return '00:00'; // Return default or loading state if duration is not valid
        }
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        // Pad with leading zero if needed
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    return (
        <div className={`text-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto flex flex-col items-center space-y-4 ${className}`}>
        {/* Hidden Audio Element */}
        <audio ref={audioRef} src={audioSrc} preload="metadata"></audio>

        {/* Play/Pause Button */}
        <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition duration-150 ease-in-out shadow-md"
        >
            {isPlaying ? <Pause size={96} /> : <Play size={96} />}
        </button>

        {/* Progress Bar and Time Display */}
        <div className="w-full flex items-center space-x-3">
            {/* Current Time */}
            <span className="text-xs font-mono w-12 text-right">{formatTime(currentTime)}</span>

            {/* Progress Bar Slider */}
            <input
            type="range"
            ref={progressBarRef}
            value={currentTime}
            max={duration || 0} // Ensure max is not NaN
            onChange={handleSeek}
            aria-label="Audio progress"
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500" // Use accent color for the thumb/progress
            />

            {/* Total Duration */}
            <span className="text-xs font-mono w-12 text-left">{formatTime(duration)}</span>
        </div>
        </div>
    );
};

// Example Usage (replace with your actual audio file URL)
// You would typically import and use this component in your Next.js pages/components like this:
// import CustomAudioPlayer from './CustomAudioPlayer'; // Adjust path as needed
//
// function MyPage() {
//   return (
//     <div>
//       <h1>My Awesome Audio</h1>
//       <CustomAudioPlayer audioSrc="/path/to/your/audio.mp3" />
//     </div>
//   );
// }

export default CustomAudioPlayer; // Export the component for use
