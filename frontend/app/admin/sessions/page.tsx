"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSessions } from "@/hooks/useSessions";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/userMessages";
import { useSummary } from "@/hooks/useSummary";
import GlassCard from "@/components/admin/GlassCard";
import {
  Phone,
  User,
  Clock,
  Bot,
  Brain,
  FileText,
  HelpCircle,
  CheckSquare,
  Search,
  ChevronRight,
  Activity,
  Calendar,
} from "lucide-react";

type MemoryTab = "summary" | "facts" | "open" | "action";

function SessionExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const selectedId = idParam ? parseInt(idParam, 10) : null;

  const { data: sessions, isLoading: loadingSessions } = useSessions();
  const { data: session, isLoading: loadingSession } = useSession(selectedId);
  const { data: messages, isLoading: loadingMessages } = useMessages(selectedId);
  const { data: summary, isLoading: loadingSummary } = useSummary(selectedId);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<MemoryTab>("summary");

  // Select the latest session by default if none specified in query params
  useEffect(() => {
    if (!idParam && sessions && sessions.length > 0) {
      router.replace(`/admin/sessions?id=${sessions[0].id}`);
    }
  }, [idParam, sessions, router]);

  const filteredSessions = sessions?.filter((s: any) => {
    const term = searchTerm.toLowerCase();
    return (
      s.roomName.toLowerCase().includes(term) ||
      s.participantIdentity.toLowerCase().includes(term) ||
      (s.persona && s.persona.toLowerCase().includes(term))
    );
  }) || [];

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
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

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
      {/* SIDEBAR LIST */}
      <div className="w-80 flex flex-col border border-blue-900/30 rounded-3xl bg-blue-950/20 p-4 overflow-hidden shadow-2xl">
        <div className="relative group w-full mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550 group-focus-within:text-blue-400 transition-colors duration-300" size={16} />
          <input
            type="text"
            placeholder="Search sessions by room or caller ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-blue-950/10 backdrop-blur-md border border-blue-900/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-inner text-sm animate-fadeIn"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin scrollbar-thumb-slate-900">
          {loadingSessions ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-550 animate-pulse">
              <Activity className="animate-spin text-blue-500" size={20} />
              <span className="text-xs font-semibold">Loading sessions...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No sessions found
            </div>
          ) : (
            filteredSessions.map((s: any) => {
              const isActive = selectedId === s.id;
              const isSessionActive = s.status === "ACTIVE";
              return (
                <button
                  key={s.id}
                  onClick={() => router.push(`/admin/sessions?id=${s.id}`)}
                  className={`
                    w-full text-left p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.01] cursor-pointer
                    \${
                      isActive
                        ? "bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.06)]"
                        : "bg-blue-950/10 border-blue-900/20 hover:bg-blue-950/20 hover:border-blue-900/40"
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[9px] font-black text-blue-400 uppercase tracking-wider shadow-sm">
                        {s.participantIdentity.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-slate-200 truncate max-w-[130px] tracking-tight">
                        {s.roomName}
                      </span>
                    </div>
                    <span
                      className={`
                        text-[8px] font-extrabold px-2 py-0.5 rounded-full border tracking-wider uppercase flex items-center gap-1
                        ${getStatusStyles(s.status)}
                      `}
                    >
                      {s.status === "ACTIVE" && (
                        <span className="h-1 w-1 rounded-full bg-amber-400 animate-ping" />
                      )}
                      {s.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="truncate max-w-[120px] text-slate-400/80 text-[11px] font-semibold">
                      ID: {s.participantIdentity}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-350">
                      <Clock size={11} className="text-slate-500" />
                      {formatDuration(s.durationSeconds)}
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar size={11} className="text-slate-650" />
                      {new Date(s.startedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-900 font-bold text-[9px] text-blue-400 uppercase tracking-widest">
                      {s.persona || "Default"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedId === null ? (
          <div className="flex-1 flex items-center justify-center border border-slate-800 rounded-3xl bg-slate-900/10 shadow-2xl">
            <div className="text-center p-8 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 mb-5 animate-bounce">
                <Phone size={24} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Select a Session</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Choose a voice conversation from the left sidebar to explore the timeline, transcript, and AI summary.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* HEADER CARD */}
            <GlassCard className="hover:border-blue-900/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-2xl relative overflow-hidden bg-gradient-to-r from-blue-950/20 via-blue-900/5 to-transparent">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/5 blur-[40px]" />
              {loadingSession ? (
                <div className="animate-pulse w-full h-14 bg-slate-900/40 rounded-xl" />
              ) : (
                <>
                  <div className="flex items-center gap-4 relative">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-inner">
                      <Phone size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-base font-extrabold text-white tracking-tight leading-tight">{session?.roomName}</h2>
                        <span
                          className={`
                            text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1
                            ${getStatusStyles(session?.status)}
                          `}
                        >
                          {session?.status === "ACTIVE" && (
                            <span className="h-1 w-1 rounded-full bg-amber-400 animate-ping" />
                          )}
                          {session?.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-4 font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-650" />
                          <span>Caller: {session?.participantIdentity}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bot size={12} className="text-slate-700" />
                          <span className="text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">{session?.persona || "Default"}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-slate-450 bg-blue-950/30 p-3 rounded-xl border border-blue-900/30 shadow-inner relative">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase font-bold text-slate-550 tracking-widest">Duration</span>
                      <span className="text-white font-extrabold flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-blue-400" />
                        {formatDuration(session?.durationSeconds)}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-blue-900/30" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase font-bold text-slate-550 tracking-widest">Started At</span>
                      <span className="text-white font-extrabold mt-0.5">
                        {session?.startedAt ? formatDate(session.startedAt) : "..."}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </GlassCard>

            {/* SPLIT PANEL CONTENT */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
              {/* TRANSCRIPT PANEL */}
              <div className="flex-1 flex flex-col border border-blue-900/30 rounded-3xl bg-blue-950/15 overflow-hidden shadow-2xl">
                <div className="border-b border-blue-900/30 p-4 bg-blue-950/10 flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-tight">Live Transcript</span>
                  <span className="text-[10px] text-blue-400 bg-blue-950/20 border border-blue-900/30 px-2 py-1 rounded-lg flex items-center gap-1.5">
                    <Activity size={10} className="text-blue-500 animate-pulse" />
                    {messages?.length || 0} messages
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
                  {loadingMessages ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse">
                      <Activity className="animate-spin text-blue-500" size={20} />
                      <span className="text-xs">Loading transcript...</span>
                    </div>
                  ) : !messages || messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No transcript recorded for this session.
                    </div>
                  ) : (
                    messages.map((m: any) => {
                      const isUser = m.speaker === "USER";
                      return (
                        <div
                          key={m.id}
                          className={`flex items-start gap-3 max-w-[85%] ${
                            isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                          }`}
                        >
                          {/* Avatar Circle */}
                          <div
                            className={`
                              flex-shrink-0 h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold shadow-md
                              ${
                                isUser
                                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                  : "bg-violet-500/10 border-violet-500/20 text-violet-400"
                              }
                            `}
                          >
                            {isUser ? <User size={14} /> : <Bot size={14} />}
                          </div>

                          <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {isUser ? "User" : "AI Agent"}
                              </span>
                              <span className="text-[9px] text-slate-600">
                                {formatTime(m.timestamp)}
                              </span>
                            </div>
                            <div
                              className={`
                                px-4.5 py-3 rounded-2xl text-sm leading-relaxed border shadow-sm
                                ${
                                  isUser
                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-500/20 rounded-tr-none"
                                    : "bg-blue-950/30 text-slate-100 border-blue-900/20 rounded-tl-none"
                                }
                              `}
                            >
                              {m.content}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AI TABS MEMORY PANEL */}
              <div className="w-full md:w-[340px] lg:w-[400px] flex flex-col border border-blue-900/30 rounded-3xl bg-blue-950/15 overflow-hidden shadow-2xl">
                {/* Tab Switcher Headers */}
                <div className="grid grid-cols-4 border-b border-blue-900/20 bg-blue-950/10 p-2.5 gap-2">
                  {(
                    [
                      { id: "summary", icon: FileText, label: "Summary" },
                      { id: "facts", icon: Brain, label: "Facts" },
                      { id: "open", icon: HelpCircle, label: "Open" },
                      { id: "action", icon: CheckSquare, label: "Actions" },
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex flex-col items-center justify-center py-5 px-3 rounded-2xl transition-all duration-300 cursor-pointer
                          ${
                            isSelected
                              ? "bg-blue-900/30 text-blue-400 border border-blue-900/30 shadow-[0_4px_12px_rgba(59,130,246,0.1)]"
                              : "text-slate-500 hover:text-slate-350 hover:bg-blue-950/20 border border-transparent"
                          }
                        `}
                      >
                        <Icon size={16} />
                        <span className="text-[10px] font-bold mt-1.5 tracking-tight">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Body */}
                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
                  {loadingSummary ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse">
                      <Activity className="animate-spin text-blue-500" size={20} />
                      <span className="text-xs">Loading memory...</span>
                    </div>
                  ) : !summary ? (
                    <div className="py-8 text-center text-slate-500 text-xs leading-relaxed">
                      No summary generated yet. Disconnect from the call to build session memory.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTab === "summary" && (
                        <div className="animate-fadeIn">
                          <div className="flex items-center gap-2 text-blue-400 mb-3 border-b border-slate-900 pb-2">
                            <FileText size={15} />
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider">Conversation Summary</h4>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                            {summary.summary || "No summary recorded."}
                          </p>
                        </div>
                      )}

                      {activeTab === "facts" && (
                        <div className="animate-fadeIn">
                          <div className="flex items-center gap-2 text-violet-400 mb-3 border-b border-slate-900 pb-2">
                            <Brain size={15} />
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider">Learned User Facts</h4>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                            {summary.userFacts || "No specific user facts extracted."}
                          </p>
                        </div>
                      )}

                      {activeTab === "open" && (
                        <div className="animate-fadeIn">
                          <div className="flex items-center gap-2 text-amber-400 mb-3 border-b border-slate-900 pb-2">
                            <HelpCircle size={15} />
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider">Open Questions</h4>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                            {summary.openItems || "No open items pending."}
                          </p>
                        </div>
                      )}

                      {activeTab === "action" && (
                        <div className="animate-fadeIn">
                          <div className="flex items-center gap-2 text-emerald-400 mb-3 border-b border-slate-900 pb-2">
                            <CheckSquare size={15} />
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider">Action Items</h4>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                            {summary.actionItems || "No pending action items."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="text-center animate-pulse">
            <Activity className="animate-spin text-blue-400 mx-auto mb-4" size={24} />
            <h1 className="text-xl font-bold">Loading Session Explorer...</h1>
          </div>
        </div>
      }
    >
      <SessionExplorerContent />
    </Suspense>
  );
}