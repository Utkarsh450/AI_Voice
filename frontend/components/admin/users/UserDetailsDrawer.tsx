"use client";

import { useState } from "react";
import {
  X,
  Brain,
  Phone,
  Clock,
  Bot,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { useUser } from "@/hooks/useUser";

interface Props {
  userId: string | null;
  onClose: () => void;
}

export default function UserDetailsDrawer({ userId, onClose }: Props) {
  const { data, isLoading } = useUser(userId ?? undefined);
  const [copied, setCopied] = useState(false);

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
      "from-blue-500 to-indigo-600 text-white shadow-blue-500/10",
      "from-violet-500 to-purple-600 text-white shadow-violet-500/10",
      "from-emerald-500 to-teal-600 text-white shadow-emerald-500/10",
      "from-orange-500 to-amber-600 text-white shadow-orange-500/10",
      "from-pink-500 to-rose-600 text-white shadow-pink-500/10",
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

  const handleCopy = () => {
    if (!data?.memory) return;
    navigator.clipboard.writeText(data.memory);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* BACKDROP OVERLAY */}
      {userId && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* DRAWER CONTAINER */}
      <div
        className={`
          fixed right-0 top-0 z-50 h-screen w-full sm:w-[480px] overflow-y-auto border-l border-slate-900 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 shadow-2xl
          ${userId ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-900 p-6 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Caller Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-semibold">
              Global context and memories
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-900 p-2 hover:bg-slate-900 hover:border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 flex flex-col gap-6 animate-pulse">
            <div className="h-24 bg-slate-900 rounded-3xl" />
            <div className="h-48 bg-slate-900 rounded-3xl" />
            <div className="h-56 bg-slate-900 rounded-3xl" />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* USER CARD HEADER */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 shadow-inner relative overflow-hidden bg-gradient-to-br from-slate-900/40 via-slate-950/60 to-transparent">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/5 blur-[30px]" />
              <div className="flex items-center gap-4 relative">
                <div
                  className={`
                    flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br font-black text-base uppercase shadow-lg border border-white/10
                    \${userId ? getGradient(userId) : ""}
                  `}
                >
                  {userId ? getInitials(userId) : ""}
                </div>

                <div>
                  <h3 className="text-lg font-black text-white truncate max-w-[280px] tracking-tight">
                    {data?.userId}
                  </h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                    AI Voice Platform Caller
                  </p>
                </div>
              </div>
            </div>

            {/* GLOBAL MEMORY */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Brain className="text-violet-400" size={18} />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                    Global Memory
                  </h3>
                </div>
                {data?.memory && (
                  <button
                    onClick={handleCopy}
                    className="text-[10px] px-2.5 py-1.5 rounded-xl border border-slate-900 bg-slate-950 hover:bg-slate-900 hover:border-slate-800 text-slate-400 hover:text-white transition-all font-bold cursor-pointer uppercase tracking-wider"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900/80">
                <p className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-normal">
                  {data?.memory || "No consolidated memories found for this caller yet."}
                </p>
              </div>
            </div>

            {/* CALL SESSIONS HISTORY */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Phone className="text-blue-400" size={18} />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Call History
                </h3>
              </div>

              <div className="space-y-3">
                {!data?.sessions || data.sessions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No recorded sessions for this user.</p>
                ) : (
                  data.sessions.map((session: any) => (
                    <Link
                      key={session.id}
                      href={`/admin/sessions?id=${session.id}`}
                      onClick={onClose}
                      className="
                        block rounded-2xl border border-slate-900 bg-slate-950/40 p-4
                        transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-900/20
                        hover:shadow-md hover:shadow-blue-500/5 group cursor-pointer
                      "
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          {session.roomName}
                        </p>

                        <span
                          className={`
                            rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border
                            ${
                              session.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }
                          `}
                        >
                          {session.status}
                        </span>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Bot size={13} className="text-slate-500" />
                          <span className="uppercase tracking-wider text-[9px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">
                            {session.persona || "Default"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-500" />
                          <span>{formatDuration(session.durationSeconds)}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                        <span>{new Date(session.startedAt).toLocaleString()}</span>
                        <span className="flex items-center gap-0.5 text-blue-400/80 group-hover:text-blue-400 font-bold uppercase tracking-wider text-[9px]">
                          Explore <ArrowRight size={10} />
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}