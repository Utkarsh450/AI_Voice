"use client";

import VoiceWave from "./VoiceWave";
import { CallState } from "@/types/call";

interface Props {
  state: CallState;
  transcript?: string;
  immersive?: boolean;
  connecting?: boolean;
  connected?: boolean;
  agentConnected?: boolean;
}

export default function ActiveCallPanel({
  state,
  transcript,
  immersive = false,
  connecting = false,
  connected = false,
  agentConnected = false,
}: Props) {
  // Map current state to mockup labels
  const getLabel = () => {
    if (connecting) return "CONNECTING TO SERVER...";
    if (connected && !agentConnected) return "INITIALIZING AGENT...";
    if (state === "listening") return "LISTENING...";
    if (state === "speaking") return "SPEAKING...";
    if (state === "thinking") return "THINKING...";
    return "IDLE";
  };

  const stateLabel = getLabel();

  const getLabelColor = () => {
    if (connecting) return "text-slate-500 animate-pulse";
    if (connected && !agentConnected) return "text-orange-400/70 animate-pulse drop-shadow-[0_0_5px_rgba(249,115,22,0.3)]";
    switch (state) {
      case "listening":
        return "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]";
      case "speaking":
        return "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]";
      case "thinking":
        return "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
      default:
        return "text-slate-500";
    }
  };

  const getPlaceholderText = () => {
    if (connecting) return "Connecting to Voice Server. Please wait...";
    if (connected && !agentConnected) return "AI Voice Agent is joining the room...";
    return "What can I help you with today?";
  };

  return (
    <div
      className={`
        flex flex-1 flex-col items-center justify-center gap-7 transition-all duration-500
        \${immersive ? "px-6 py-2" : "border-b border-slate-900 px-6 py-10"}
      `}
    >
      {/* 1. Radar Visualizer Ring */}
      <VoiceWave 
        state={connecting ? "thinking" : (connected && !agentConnected ? "thinking" : state)} 
        immersive={immersive} 
      />

      {/* 2. Uppercase Subtitle State */}
      <div className="text-center">
        <h3 className={`text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 \${getLabelColor()}`}>
          {stateLabel}
        </h3>
      </div>

      {/* 3. Framed Transcript Card */}
      <div className="w-full max-w-lg rounded-2xl border border-slate-900 bg-slate-950/60 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 block mb-3">
          Transcript
        </span>

        <p className="text-slate-200 text-base leading-relaxed font-normal min-h-[48px]">
          {transcript || getPlaceholderText()}
        </p>
      </div>

      {/* 4. Timeline pill indicator states */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
        {(["idle", "listening", "thinking", "speaking"] as const).map((s) => {
          const isActive = !connecting && agentConnected && (state === s || (s === "idle" && !state));
          const isConnectingActive = (connecting || (connected && !agentConnected)) && s === "idle";
          return (
            <span
              key={s}
              className={`
                px-4.5 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300
                \${
                  isActive
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.15)] scale-[1.03]"
                    : isConnectingActive
                    ? "bg-slate-900/40 text-slate-400 border-slate-800/80 animate-pulse"
                    : "bg-slate-950/30 text-slate-600 border-slate-900/60"
                }
              `}
            >
              {s === "idle" ? "Idle" : s}
            </span>
          );
        })}
      </div>
    </div>
  );
}