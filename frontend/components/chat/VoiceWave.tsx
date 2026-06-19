"use client";

import { CallState } from "@/types/call";
import WaveRing from "./WaveRing";

interface Props {
  state: CallState;
  immersive?: boolean;
}

export default function VoiceWave({
  state,
  immersive = false,
}: Props) {
  return (
    <div
      className={`
        relative flex
        items-center justify-center
        transition-all duration-500
        ${
          immersive
            ? "h-[420px] w-[420px]"
            : "h-56 w-56"
        }
      `}
    >
      {state ===
        "listening" && (
        <>
          <WaveRing
            delay={0}
          />
          <WaveRing
            delay={400}
          />
        </>
      )}

      {state ===
        "speaking" && (
        <>
          <WaveRing
            delay={0}
          />
          <WaveRing
            delay={300}
          />
          <WaveRing
            delay={600}
          />
        </>
      )}

      <div
        className={`
          flex items-center
          justify-center
          rounded-full
          bg-gradient-to-br
          from-blue-500
          to-indigo-600
          text-white
          transition-all duration-500
          ${
            immersive
              ? "h-48 w-48 text-7xl"
              : "h-28 w-28 text-5xl"
          }
          ${
            state ===
            "thinking"
              ? "animate-pulse"
              : ""
          }
        `}
      >
        🎙️
      </div>
    </div>
  );
}