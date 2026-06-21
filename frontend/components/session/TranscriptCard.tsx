"use client";

import { useMessages } from "../../hooks/userMessages";
import { User, Bot, Activity } from "lucide-react";

interface Props {
  sessionId: number | null;
}

export default function TranscriptCard({ sessionId }: Props) {
  const { data, isLoading } = useMessages(sessionId);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">Transcript</h3>
        {data && data.length > 0 && (
          <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">
            {data.length} Messages
          </span>
        )}
      </div>

      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500 animate-pulse">
          <Activity className="animate-spin text-orange-500" size={16} />
          <span className="text-xs">Loading logs...</span>
        </div>
      )}

      {!isLoading && !data?.length && (
        <p className="text-xs text-slate-500 text-center py-6">
          No transcript logs recorded for this session.
        </p>
      )}

      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-900">
        {data?.map((message: any) => {
          const isUser = message.speaker === "USER";
          return (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 max-w-[90%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Mini Avatar */}
              <div
                className={`
                  flex-shrink-0 h-6.5 w-6.5 rounded-full border flex items-center justify-center text-[9px] font-bold
                  ${
                    isUser
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                  }
                `}
              >
                {isUser ? <User size={10} /> : <Bot size={10} />}
              </div>

              {/* Message content */}
              <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">
                    {isUser ? "User" : "Agent"}
                  </span>
                  <span className="text-[8px] text-slate-600 font-semibold">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div
                  className={`
                    px-3 py-2 rounded-xl text-xs leading-relaxed border
                    ${
                      isUser
                        ? "bg-gradient-to-br from-blue-600/90 to-indigo-600/90 text-white border-blue-500/10 rounded-tr-none"
                        : "bg-slate-900/60 text-slate-200 border-slate-800/80 rounded-tl-none"
                    }
                  `}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}