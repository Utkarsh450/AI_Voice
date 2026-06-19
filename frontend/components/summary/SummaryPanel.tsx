"use client";

import { useSummary } from "@/hooks/useSummary";

interface Props {
  sessionId: number | null;
}

export default function SummaryPanel({
  sessionId,
}: Props) {
  const {
    data,
    isLoading,
  } = useSummary(sessionId);

  if (!sessionId) {
    return (
      <aside className="w-96 border-l border-slate-800 bg-slate-900/70 p-6">
        <div className="flex h-full items-center justify-center text-slate-500">
          Select a session
        </div>
      </aside>
    );
  }

  if (isLoading) {
    return (
      <aside className="w-96 border-l border-slate-800 bg-slate-900/70 p-6">
        <div className="flex h-full items-center justify-center text-slate-500">
          Loading summary...
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 border-l border-slate-800 bg-slate-900/70 p-6">
      <div className="space-y-8">
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Summary
          </h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
            {data?.summary ||
              "No summary found"}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Action Items
          </h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
            {data?.actionItems ||
              "No action items"}
          </div>
        </div>
      </div>
    </aside>
  );
}