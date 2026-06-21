"use client";

import { useRecording } from "@/hooks/useRecording";
import { Play, Activity } from "lucide-react";

interface Props {
  sessionId: number | null;
}

export default function RecordingCard({ sessionId }: Props) {
  const { data, isLoading } = useRecording(sessionId);

  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3.5">
        <Play className="text-orange-500" size={16} />
        <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">Recording</h3>
      </div>

      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500 animate-pulse">
          <Activity className="animate-spin text-orange-500" size={16} />
          <span className="text-xs">Loading recording...</span>
        </div>
      )}

      {!isLoading && !data && (
        <p className="text-xs text-slate-500 text-center py-6">
          Recording file will process and attach once the call terminates.
        </p>
      )}

      {data && (
        <div className="p-1.5 rounded-2xl bg-slate-900/30 border border-slate-900/50">
          <audio controls className="w-full text-xs">
            <source src={data.fileUrl} />
          </audio>
        </div>
      )}
    </div>
  );
}
