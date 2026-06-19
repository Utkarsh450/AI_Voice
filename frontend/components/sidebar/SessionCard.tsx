import { Clock } from "lucide-react";
import { Session } from "@/types/session";

interface Props {
  session: Session;
  selected: boolean;
  compact?: boolean;
  onClick: () => void;
}

export default function SessionCard({
  session,
  selected,
  compact,
  onClick,
}: Props) {
  return (
   
  
   <button
  onClick={onClick}
  className={`
    w-full rounded-3xl
    border p-4 text-left
    transition-all duration-300
    hover:border-slate-700
    hover:bg-slate-900
    ${
      selected
        ? "border-blue-500 bg-blue-500/10"
        : "border-slate-800 bg-slate-900/40"
    }
  `}
>
  {compact ? (
   <div
  className="
    flex h-14 w-14
    items-center justify-center
    rounded-2xl
    border border-slate-800
    bg-slate-900
    text-xl
  "
>
</div>
  ) : (
  <>
  <div className="flex items-center gap-3">
   <div
  className="
    flex h-14 w-14
    items-center justify-center
    rounded-2xl
    border border-slate-800
    bg-slate-900
    text-xl
  "
>
  🎙️
</div>

    <div className="min-w-0 flex-1">
      <p className="truncate font-medium text-white">
        {session.roomName ||
          "Voice Session"}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {session.participantIdentity ||
          "Unknown User"}
      </p>
    </div>
  </div>

  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
    <span>⏱ 03:21</span>

    <div className="flex items-center gap-2">
      <span>🎧</span>
      <span>📝</span>
      <span>📄</span>
    </div>
  </div>
</>
  )}
</button>
  );
}