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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(context || null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameIdRef = useRef<number>(0);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!hasUserInteracted || audioContext) return;

    const initAudio = async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = ctx.createAnalyser();
        
        setAudioContext(ctx);
        setAnalyser(analyserNode);
        dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);
        
        // Some browsers need this to be called after user interaction
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
      } catch (error) {
        console.error("Audio initialization failed:", error);
      }
    };

    initAudio();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [hasUserInteracted]);

  // Handle audio playback when URL changes
  useEffect(() => {
    if (!audioUrl || !hasUserInteracted || !audioRef.current || !audioContext || !analyser) return;

    const audioElement = audioRef.current;
    let audioSource: MediaElementAudioSourceNode;

    const playAudio = async () => {
      try {
        // Connect audio nodes
        audioSource = audioContext.createMediaElementSource(audioElement);
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);

        // Start visualization
        draw();

        // Play audio
        await audioElement.play();
        console.log("Audio playback started");
      } catch (error) {
        console.error("Audio playback failed:", error);
      }
    };

    const handleEnded = () => {
      toggleBoolean("getResponse", false);
      setRefreshSTTCount();
      if (audioSource) {
        audioSource.disconnect();
      }
    };

    audioElement.addEventListener('ended', handleEnded);
    playAudio();

    return () => {
      audioElement.removeEventListener('ended', handleEnded);
      if (audioSource) {
        audioSource.disconnect();
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [audioUrl, hasUserInteracted, audioContext, analyser]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !dataArrayRef.current) return;

    animationFrameIdRef.current = requestAnimationFrame(draw);

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const canvasContext = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    if (!canvasContext) return;

    analyser.getByteFrequencyData(dataArrayRef.current);
    canvasContext.clearRect(0, 0, width, height);

    const barWidth = 10;
    let x = 0;
    const startColor = [19, 239, 147];
    const endColor = [20, 154, 251];

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
      const value = dataArrayRef.current[i];
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
      <canvas ref={canvasRef} width={window.innerWidth} height={100} />
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          controls={false}
          playsInline // Important for iOS
          preload="auto"
          style={{ display: 'none' }}
        />
      )}
    </>
  );
};

export default AgentVisualizer;
