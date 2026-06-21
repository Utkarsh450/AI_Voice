"use client";

import { ChevronRight } from "lucide-react";
import TranscriptCard from "./TranscriptCard";
import SummaryCard from "./SummaryCard";
import RecordingCard from "./RecordingCard";

interface Props {
  sessionId: number | null;
  open: boolean;
  onToggle: () => void;
}

export default function SessionDetailsSidebar({
  sessionId,
  open,
  onToggle,
}: Props) {
  return (
    <aside
      className={`border-l border-slate-900 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 ${
        open ? "w-[380px]" : "w-12"
      }`}
    >
      <div
        className={`
          flex h-full flex-col
          ${open ? "" : "items-center justify-center"}
        `}
      >
        {open ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-900 px-6 py-5">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Call Analysis
              </h2>

              <button
                onClick={onToggle}
                className="rounded-xl border border-slate-900 p-2 text-slate-400 transition-all hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="rounded-xl border border-slate-900 p-2.5 text-slate-400 hover:bg-slate-900 hover:text-white cursor-pointer transition-all"
          >
            ▶
          </button>
        )}
        
        {open && (
          <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
            <TranscriptCard sessionId={sessionId} />
            <SummaryCard sessionId={sessionId} />
            <RecordingCard sessionId={sessionId} />
          </div>
        )}
      </div>
    </aside>
  );
}
