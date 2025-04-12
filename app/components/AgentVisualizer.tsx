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
  const {toggleBoolean, setRefreshSTTCount} = useChatPalStore((state) => state);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioElmRef = useRef<HTMLAudioElement | null>(null);
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
  }
  const analyser = context.createAnalyser();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  useEffect(() => {
    // console.log("The context is: ", context);
    if (!audioUrl) return;
    let audioSource: AudioNode;

    if (audioElmRef.current instanceof MediaStream) {
      audioElmRef.current.volume = 0.5;
      audioSource = context!.createMediaStreamSource(audioElmRef.current);
    } else {
      audioElmRef!.current!.volume = 0.5;
      audioSource = context!.createMediaElementSource(audioElmRef.current as HTMLMediaElement);
      audioSource.connect(context!.destination);
    }
    
    audioSource.connect(analyser);
    draw();

    const handleEnded = () => {
      toggleBoolean("getResponse", false);
      audioSource.disconnect();
      setRefreshSTTCount();
      console.log("Audio has stopped playing")
    }

    audioElmRef.current?.addEventListener("ended", handleEnded);
    
    return () => {
      audioElmRef.current?.removeEventListener("ended", handleEnded)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  const draw = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const canvasContext = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    requestAnimationFrame(draw);
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
        <canvas className="relative" ref={canvasRef} width={window.innerWidth}></canvas>
        {audioUrl && (
          <audio 
            src={audioUrl ?? ""} 
            ref={audioElmRef} 
            controls
            autoPlay
            preload="auto"
            className="absolute" 
          />
        )}
      </>
    )
};

export default AgentVisualizer;
