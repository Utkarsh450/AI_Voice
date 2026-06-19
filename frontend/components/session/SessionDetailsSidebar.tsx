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
      className={`border-l border-slate-800 bg-slate-950 transition-all duration-300 ${
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
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <h2 className="text-lg font-semibold text-white">
                Session Details
              </h2>

              <button
                onClick={onToggle}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            ▶
          </button>
        )}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <TranscriptCard sessionId={sessionId} />

          <SummaryCard sessionId={sessionId} />
          <RecordingCard
  sessionId={sessionId}
/>

          <RecordingCard sessionId={sessionId} />
        </div>
      </div>
    </aside>
  );
}
