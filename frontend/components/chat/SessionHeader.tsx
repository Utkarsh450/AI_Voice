import { User, Clock, Sparkles, PanelLeft, PanelRight } from "lucide-react";
import { useSession } from "@/hooks/useSession";

interface Props {
  sessionId: number | null;
  leftSidebarOpen?: boolean;
  rightSidebarOpen?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

export default function SessionHeader({
  sessionId,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeft,
  onToggleRight,
}: Props) {
  const { data } = useSession(sessionId);

  return (
    <div className="border-b border-slate-900 bg-slate-950/80 px-8 py-5 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {onToggleLeft && (
          <button
            onClick={onToggleLeft}
            className="p-2 rounded-xl border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer mr-1"
            title="Toggle Left Sidebar"
          >
            <PanelLeft size={16} />
          </button>
        )}
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            {data ? data.roomName : "Voice AI Call Room"}
          </h2>

          {data && (
            <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-slate-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-slate-500" />
                <span>{data.participantIdentity}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-500" />
                <span>{data.durationSeconds ?? 0}s</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-slate-500" />
                <span className="uppercase text-[9px] font-bold text-orange-400 bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10 tracking-wider">
                  {data.persona || "Default"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {onToggleRight && sessionId && (
        <button
          onClick={onToggleRight}
          className="p-2 rounded-xl border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
          title="Toggle Details Sidebar"
        >
          <PanelRight size={16} />
        </button>
      )}
    </div>
  );
}