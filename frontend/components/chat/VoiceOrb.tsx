"use client";

import { motion } from "framer-motion";
import { CallState } from "@/types/call";

interface Props {
  state: CallState;
}

export default function VoiceOrb({ state }: Props) {
  const speaking = state === "speaking";

  const listening = state === "listening";

  const thinking = state === "thinking";

  return (
    <div className="relative flex h-72 w-72 items-center justify-center">
      {(speaking || listening) && (
        <>
          <motion.div
            className="absolute h-52 w-52 rounded-full bg-blue-500/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          <motion.div
            className="absolute h-64 w-64 rounded-full bg-indigo-500/20"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
            }}
          />
        </>
      )}

      <motion.div
        animate={{
          scale: thinking ? [1, 1.08, 1] : speaking ? [1, 1.15, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
        className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_80px_rgba(59,130,246,0.45)]"
      >
        <div className="h-24 w-24 rounded-full bg-white/15 backdrop-blur-xl" />
      </motion.div>
    </div>
  );
}
