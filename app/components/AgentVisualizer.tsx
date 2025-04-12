"use client"
import { useChatPalStore } from "@/providers/chatpal-store-provider";
import React, { useEffect, useRef, useState } from "react";

type AudioInput = MediaStream | HTMLAudioElement;

const interpolateColor = (
  startColor: number[],
  endColor: number[],
  factor: number,
): number[] => {
  const result = [];
  for (let i = 0; i < startColor.length; i++) {
    result[i] = Math.round(
      startColor[i] + factor * (endColor[i] - startColor[i]),
    );
  }
  return result;
};

interface VisualizerProps {
  audioUrl: string;
  context?: AudioContext;
}

const AgentVisualizer: React.FC<VisualizerProps> = ({ audioUrl, context }) => {
  const {toggleBoolean, setRefreshSTTCount, hasUserInteracted} = useChatPalStore((state) => state);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioElmRef = useRef<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(context || null);
  // Initialize or get audio context
  const getAudioContext = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  };

  useEffect(() => {
    if (!audioUrl || !hasUserInteracted) return;
    
    const ctx = getAudioContext();
    const analyser = ctx.createAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let audioSource: AudioNode;
    const audioElement = audioElmRef.current;

    if (!audioElement) return;

    // Handle mobile audio context suspension
    const handlePlay = async () => {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        if (audioElement instanceof HTMLAudioElement) {
          await audioElement.play();
        }
        
        // Setup audio source and analyzer
        audioSource = ctx.createMediaElementSource(audioElement);
        audioSource.connect(analyser);
        audioSource.connect(ctx.destination);
        
        draw(analyser, dataArray);
      } catch (error) {
        console.error("Audio playback failed:", error);
      }
    };

    const handleEnded = () => {
      toggleBoolean("getResponse", false);
      if (audioSource) {
        audioSource.disconnect();
      }
      setRefreshSTTCount();
    };

    audioElement.addEventListener("ended", handleEnded);
    handlePlay();

    return () => {
      audioElement.removeEventListener("ended", handleEnded);
      // if (audioSource) {
      //   audioSource.disconnect();
      // }
    };
  }, [audioUrl, hasUserInteracted]);

  const draw = (analyser: AnalyserNode, dataArray: Uint8Array): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const canvasContext = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    requestAnimationFrame(() => draw(analyser, dataArray));
    analyser.getByteFrequencyData(dataArray);

    if (!canvasContext) return;

    canvasContext.clearRect(0, 0, width, height);

    const barWidth = 10;
    let x = 0;
    const startColor = [19, 239, 147];
    const endColor = [20, 154, 251];

    for (const value of dataArray) {
      const barHeight = (value / 255) * height * 2;
      const interpolationFactor = value / 255;
      const color = interpolateColor(startColor, endColor, interpolationFactor);

      canvasContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.1)`;
      canvasContext.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth;
    }
  };

  return (
    <>
      <canvas ref={canvasRef} width={window.innerWidth}></canvas>
      {audioUrl && (
        <audio 
          src={audioUrl} 
          ref={audioElmRef} 
          className="w-0" 
          // Only add autoplay if user has interacted
          autoPlay={hasUserInteracted}
        />
      )}
    </>
  );
};

export default AgentVisualizer;
