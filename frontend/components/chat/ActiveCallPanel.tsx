"use client";

import LiveTranscript from "./LiveTranscript";
import VoiceWave from "./VoiceWave";
import { CallState } from "@/types/call";

interface Props {
  state: CallState;
  transcript?: string;
  immersive?: boolean;
}

export default function ActiveCallPanel({
  state,
  transcript,
  immersive = false,
}: Props) {
  const title =
    state ===
    "listening"
      ? "Listening..."
      : state ===
          "speaking"
        ? "Speaking..."
        : state ===
            "thinking"
          ? "Thinking..."
          : "Ready";

  return (
    <div
      className={`
        flex flex-1 flex-col
        items-center justify-center
        gap-8 transition-all duration-500
        ${
          immersive
            ? "px-8 py-0"
            : "border-b border-slate-800 px-8 py-16"
        }
      `}
    >
      <VoiceWave
        state={state}
        immersive={
          immersive
        }
      />

   <div className="text-center">
  <h2 className="text-2xl font-bold text-white">
    {title}
  </h2>
</div>

<div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
  <p className="text-sm text-slate-400">
    Latest Transcript
  </p>

  <p className="mt-3 text-lg text-white">
    {transcript ||
      "Start speaking..."}
  </p>
</div>
    </div>
  );
}