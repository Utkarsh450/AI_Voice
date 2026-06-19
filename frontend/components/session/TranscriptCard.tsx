"use client";

import { useMessages } from "../../hooks/userMessages";

interface Props {
  sessionId: number | null;
}

export default function TranscriptCard({
  sessionId,
}: Props) {
  const {
    data,
    isLoading,
  } = useMessages(
    sessionId
  );

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Transcript
      </h3>

      {isLoading && (
        <p className="text-slate-400">
          Loading...
        </p>
      )}

      {!isLoading &&
        !data?.length && (
          <p className="text-slate-400">
            No messages yet.
          </p>
        )}

      <div className="space-y-4">
        {data?.map(
          (message: any) => (
            <div
              key={
                message.id
              }
            >
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                {message.speaker}
              </p>

              <p className="text-sm text-slate-200">
                {
                  message.content
                }
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}