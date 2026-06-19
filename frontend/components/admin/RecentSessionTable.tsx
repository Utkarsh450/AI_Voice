import GlassCard from "./GlassCard";
import { useRecentSessions } from "../../hooks/useRecentSession";

export default function RecentSessionsTable() {
  const { data, isLoading } = useRecentSessions();

  return (
    <GlassCard>
      <h2
        className="
        mb-6
        text-xl
        font-semibold
      "
      >
        Recent Sessions
      </h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {data?.map((session: any) => (
            <div
              key={session.id}
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-800
                pb-4
              "
            >
              <div>
                <p
                  className="
                    font-medium
                  "
                >
                  {session.roomName}
                </p>

                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  {session.participantIdentity}
                </p>
              </div>

              <div
                className="
                  text-sm
                  text-slate-400
                "
              >
                {session.durationSeconds ?? 0}s
              </div>

              <div
                className={`
                  rounded-full
                  px-3 py-1
                  text-xs
                  ${
                    session.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }
                `}
              >
                {session.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
