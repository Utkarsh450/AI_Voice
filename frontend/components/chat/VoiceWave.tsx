"use client";

import { CallState } from "@/types/call";

interface Props {
  state: CallState;
  immersive?: boolean;
}

export default function VoiceWave({ state, immersive = false }: Props) {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isIdle = state === "idle" || !state;

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-500
        ${immersive ? "h-[360px] w-[360px]" : "h-52 w-52"}
      `}
    >
      {/* Outer pulsing ring */}
      <div
        className={`absolute rounded-full border border-orange-500/10 transition-all duration-700
          ${isListening ? "w-64 h-64 animate-ping opacity-35" : ""}
          ${isSpeaking ? "w-72 h-72 animate-[ping_1.5s_ease-in-out_infinite] opacity-25 border-orange-500/20" : ""}
          ${isThinking ? "w-60 h-60 animate-pulse opacity-15" : ""}
          ${isIdle ? "w-52 h-52 opacity-0" : ""}
        `}
      />

      {/* Segmented Radar SVG Ring */}
      <div
        className={`relative flex items-center justify-center transition-transform duration-500 ${
          isSpeaking ? "scale-105" :
          isListening ? "scale-100" :
          isThinking ? "scale-95" :
          "scale-90"
        }`}
      >
        <svg
          width={immersive ? "260" : "190"}
          height={immersive ? "260" : "190"}
          viewBox="0 0 100 100"
          className={`transition-all duration-500 ${
            isSpeaking ? "animate-[spin_3s_linear_infinite]" :
            isListening ? "animate-[spin_6s_linear_infinite]" :
            isThinking ? "animate-[spin_10s_linear_infinite]" :
            "animate-[spin_16s_linear_infinite]"
          }`}
        >
          {/* Dashboard ring background shadow */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#f97316"
            strokeWidth="2.5"
            fill="transparent"
            strokeDasharray="3.5 1.8"
            className={`transition-all duration-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.95)] opacity-90`}
          />
        </svg>

        {/* Center core indicating sound activity */}
        <div
          className={`absolute rounded-full transition-all duration-500 flex items-center justify-center
            ${isSpeaking ? "w-11 h-11 bg-orange-500/30 shadow-[0_0_22px_rgba(249,115,22,0.65)] border border-orange-500/50 animate-pulse" : ""}
            ${isListening ? "w-9 h-9 bg-orange-500/20 shadow-[0_0_16px_rgba(249,115,22,0.45)] border border-orange-500/35" : ""}
            ${isThinking ? "w-7 h-7 bg-orange-500/15 shadow-[0_0_12px_rgba(249,115,22,0.35)] animate-[pulse_1s_ease-in-out_infinite] border border-orange-500/25" : ""}
            ${isIdle ? "w-5 h-5 bg-orange-500/5 border border-orange-500/10" : ""}
          `}
        >
          <div
            className={`rounded-full bg-orange-500 transition-all duration-500
              ${isSpeaking ? "w-3 h-3 shadow-[0_0_12px_#f97316]" : ""}
              ${isListening ? "w-2.5 h-2.5 shadow-[0_0_9px_#f97316] animate-pulse" : ""}
              ${isThinking ? "w-2 h-2" : ""}
              ${isIdle ? "w-1.5 h-1.5 opacity-55" : ""}
            `}
          />
        </div>
      </div>
    </div>
  );
}