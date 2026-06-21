"use client";

import { useSummary } from "@/hooks/useSummary";
import { FileText, CheckSquare, Brain, HelpCircle, Activity } from "lucide-react";

interface Props {
  sessionId: number | null;
}

export default function SummaryCard({ sessionId }: Props) {
  const { data, isLoading } = useSummary(sessionId);

  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3.5">
        <Brain className="text-orange-500" size={16} />
        <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">AI Analysis</h3>
      </div>

      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500 animate-pulse">
          <Activity className="animate-spin text-orange-500" size={16} />
          <span className="text-xs">Loading analysis...</span>
        </div>
      )}

      {!isLoading && !data && (
        <p className="text-xs text-slate-500 text-center py-6 leading-relaxed">
          Analysis summary and memories will compile here once the call session completes.
        </p>
      )}

      {data && (
        <div className="space-y-4.5">
          {/* Summary Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-extrabold uppercase tracking-wider mb-2">
              <FileText size={13} className="text-slate-500" />
              <span>Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal p-3 rounded-xl bg-slate-900/30 border border-slate-900/60 whitespace-pre-wrap">
              {data.summary || "No summary recorded."}
            </p>
          </div>

          {/* User Facts Section */}
          {data.userFacts && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-extrabold uppercase tracking-wider mb-2">
                <Brain size={13} className="text-slate-500" />
                <span>Extracted Facts</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal p-3 rounded-xl bg-slate-900/30 border border-slate-900/60 whitespace-pre-wrap">
                {data.userFacts}
              </p>
            </div>
          )}

          {/* Action Items Section */}
          {data.actionItems && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-extrabold uppercase tracking-wider mb-2">
                <CheckSquare size={13} className="text-slate-500" />
                <span>Action Items</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal p-3 rounded-xl bg-slate-900/30 border border-slate-900/60 whitespace-pre-wrap">
                {data.actionItems}
              </p>
            </div>
          )}

          {/* Open Questions Section */}
          {data.openItems && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-extrabold uppercase tracking-wider mb-2">
                <HelpCircle size={13} className="text-slate-500" />
                <span>Open Questions</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal p-3 rounded-xl bg-slate-900/30 border border-slate-900/60 whitespace-pre-wrap">
                {data.openItems}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
