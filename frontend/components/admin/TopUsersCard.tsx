import GlassCard from "./GlassCard";
import { useTopUsers } from "@/hooks/useTopUsers";

export default function TopUsersCard() {
  const {
    data,
    isLoading,
  } = useTopUsers();

  return (
    <GlassCard>
      <h2
        className="
        mb-6
        text-xl
        font-semibold
      "
      >
        Top Users
      </h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {data?.map((user: any) => (
            <div
              key={user.userId}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/30 border border-slate-900/50 hover:bg-slate-900/10 hover:border-slate-900/90 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400 uppercase shadow-inner">
                  {user.userId.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-slate-300 truncate max-w-[150px]">{user.userId}</span>
              </div>

              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-extrabold uppercase tracking-widest shadow-inner">
                {user.calls} calls
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}