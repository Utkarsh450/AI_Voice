"use client";

import { User, Clock, Sparkles } from "lucide-react";
import { useSession } from "@/hooks/useSession";

interface Props {
  sessionId: number | null;
}

export default function SessionHeader({
  sessionId,
}: Props) {
  const { data } =
    useSession(sessionId);

  if (!sessionId || !data) {
    return null;
  }

  return (
    <div className="border-b border-slate-800 bg-slate-900/50 px-8 py-5 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white">
        {data.roomName}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <User size={16} />
          {data.participantIdentity}
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} />
          {data.durationSeconds ?? 0}s
        </div>

        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          {data.persona}
        </div>
      </div>
    </div>
  );
}