"use client";

import { useSummary } from "@/hooks/useSummary";

interface Props {
  sessionId: number | null;
}

export default function SummaryCard({ sessionId }: Props) {
  const { data, isLoading } = useSummary(sessionId);
  const messages = Array.isArray(data)
  ? data
  : [];
  console.log("Message", data);
  
  

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Summary</h3>

      {isLoading && <p className="text-slate-400">Loading...</p>}

      {!isLoading && !data && (
        <p className="text-slate-400">
          Summary will appear after the call ends.
        </p>
      )}

      {data && (
        <>
          <p className="text-sm text-slate-200">{data.summary}</p>

          {data?.actionItems?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-white">
                Action Items
              </p>

              <ul className="space-y-2 text-sm text-slate-300">
                  <li>• {data.actionItems}</li>
                
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
