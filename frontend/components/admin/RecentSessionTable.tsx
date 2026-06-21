"use client";

import { useEffect, useState } from "react";
import GlassCard from "./GlassCard";
import { useRecentSessions } from "../../hooks/useRecentSession";
import { Clock, User, ArrowRight, Activity, Bot } from "lucide-react";
import Link from "next/link";

export default function RecentSessionsTable() {
  const { data, isLoading } = useRecentSessions();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!isMounted) return "...";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusStyles = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "FAILED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <GlassCard className="hover:border-blue-900/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Recent Sessions</h2>
          <p className="text-sm text-slate-400 mt-1">Latest voice interactions in the platform</p>
        </div>
        <Link
          href="/admin/sessions"
          className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center items-center text-slate-400">
          <div className="animate-pulse flex items-center gap-2">
            <Activity className="animate-spin text-blue-400" size={18} />
            Loading sessions...
          </div>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-8 text-center text-slate-500">No sessions recorded yet.</div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <div className="overflow-hidden border border-blue-900/30 rounded-2xl bg-blue-950/10">
              <table className="min-w-full divide-y divide-blue-900/20">
                <thead>
                  <tr className="bg-blue-950/30 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Room &amp; Persona</th>
                    <th scope="col" className="px-6 py-4">Caller Identity</th>
                    <th scope="col" className="px-6 py-4 hidden md:table-cell">Started At</th>
                    <th scope="col" className="px-6 py-4">Duration</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-transparent text-sm">
                  {data.map((session: any) => (
                    <tr
                      key={session.id}
                      className="hover:bg-blue-950/20 transition-colors duration-200"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{session.roomName}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Bot size={12} className="text-slate-400" />
                            {session.persona || "Default Persona"}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400 uppercase tracking-wider shadow-sm">
                            {session.participantIdentity.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-350">{session.participantIdentity}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 hidden md:table-cell text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-650" />
                          <span className="text-xs font-medium text-slate-450">{formatDate(session.startedAt)}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-slate-300">
                        {formatDuration(session.durationSeconds)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border
                            ${getStatusStyles(session.status)}
                          `}
                        >
                          {session.status === "ACTIVE" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                          )}
                          {session.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/admin/sessions?id=${session.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-950/40 border border-blue-900/30 text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all font-semibold text-xs inline-flex items-center gap-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                        >
                          Explore <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
