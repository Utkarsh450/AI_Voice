"use client";

import { useRecording } from "@/hooks/useRecording";

interface Props {
  sessionId: number | null;
}

export default function RecordingCard({ sessionId }: Props) {
  const { data, isLoading } = useRecording(sessionId);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Recording</h3>

      {isLoading && <p className="text-slate-400">Loading...</p>}

      {!isLoading && !data && (
        <p className="text-slate-400">
          Recording will appear after the call ends.
        </p>
      )}

      {data && (
        <audio controls className="w-full">
          <source src={data.fileUrl} />
        </audio>
      )}
    </div>
  );
}
