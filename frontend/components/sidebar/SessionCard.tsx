"use client";

import { Clock, Bot, Activity } from "lucide-react";
import { Session } from "@/types/session";

interface Props {
  session: Session;
  selected: boolean;
  compact?: boolean;
  onClick: () => void;
}

export default function SessionCard({
  session,
  selected,
  compact,
  onClick,
}: Props) {
  const getInitials = (id: string) => {
    if (!id) return "?";
    const parts = id.split(/[-_\s]+/);
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return id.substring(0, 2).toUpperCase();
  };

  const getGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % 5;
    const gradients = [
      "from-blue-500 to-indigo-600 text-white",
      "from-violet-500 to-purple-600 text-white",
      "from-emerald-500 to-teal-600 text-white",
      "from-orange-500 to-amber-600 text-white",
      "from-pink-500 to-rose-600 text-white",
    ];
    return gradients[colorIndex];
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isSessionActive = session.status === "ACTIVE";

  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-2xl border text-left p-3.5 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between
        ${
          selected
            ? "bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/40 shadow-lg shadow-orange-500/5"
            : "bg-slate-900/10 border-slate-900/80 hover:bg-slate-900/30 hover:border-slate-800"
        }
      `}
    >
      {compact ? (
        <div
          className={`
            flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-xs uppercase shadow-md mx-auto
            ${getGradient(session.participantIdentity || "unknown")}
          `}
        >
          {getInitials(session.participantIdentity || "unknown")}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 w-full">
            {/* Gradient Avatar */}
            <div
              className={`
                flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-xs uppercase shadow-sm
                ${getGradient(session.participantIdentity || "unknown")}
              `}
            >
              {getInitials(session.participantIdentity || "unknown")}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate font-bold text-slate-100 text-sm tracking-tight">
                  {session.roomName || "Voice Session"}
                </p>

                <span
                  className={`
                    text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-0.5
                    ${
                      isSessionActive
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }
                  `}
                >
                  {isSessionActive && (
                    <span className="h-1 w-1 rounded-full bg-yellow-400 animate-ping" />
                  )}
                  {session.status}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400 font-semibold truncate">
                {session.participantIdentity || "Unknown User"}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-slate-500" />
              {formatDuration(session.durationSeconds)}
            </span>

            <span className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900 font-extrabold text-[9px] uppercase tracking-wider text-slate-400">
              <Bot size={10} className="text-slate-500" />
              {session.persona || "Default"}
            </span>
          </div>
        </>
      )}
    </button>
  );
}