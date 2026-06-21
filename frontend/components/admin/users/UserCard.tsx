"use client";

import {
  User,
  Phone,
  Calendar,
} from "lucide-react";

interface Props {
  user: any;
  onClick: () => void;
}

export default function UserCard({ user, onClick }: Props) {
  const getInitials = (id: string) => {
    if (!id) return "?";
    const parts = id.split(/[-_\s]+/);
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return id.substring(0, 2).toUpperCase();
  };

  const getGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % 5;
    const gradients = [
      "from-blue-500 to-indigo-600 text-white shadow-blue-500/10",
      "from-violet-500 to-purple-600 text-white shadow-violet-500/10",
      "from-emerald-500 to-teal-600 text-white shadow-emerald-500/10",
      "from-sky-500 to-blue-600 text-white shadow-sky-500/10",
      "from-pink-500 to-rose-600 text-white shadow-pink-500/10",
    ];
    return gradients[colorIndex];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return (
    <button
      onClick={onClick}
      className="
        rounded-2xl border border-blue-900/30 bg-blue-950/20 p-6 text-left shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        transition-all duration-300 transform hover:scale-[1.015] hover:border-blue-500/30
        hover:bg-blue-950/30 hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)] cursor-pointer flex flex-col justify-between min-h-[190px] group w-full
      "
    >
      <div className="flex items-start gap-4 w-full">
        {/* Gradient avatar circle */}
        <div
          className={`
            flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl
            bg-gradient-to-br font-bold text-sm tracking-wider shadow-lg uppercase
            ${getGradient(user.userId)}
          `}
        >
          {getInitials(user.userId)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-white text-base truncate group-hover:text-blue-400 transition-colors tracking-tight">
            {user.userId}
          </h3>
          <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest mt-1">
            AI Voice Caller
          </p>
        </div>
      </div>

      {/* Memory preview snippet */}
      <div className="w-full my-4 flex-1">
        {user.memory ? (
          <p className="text-xs text-slate-350 line-clamp-2 italic leading-relaxed">
            "{user.memory}"
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic leading-relaxed">
            No memories registered yet for this caller.
          </p>
        )}
      </div>

      <div className="w-full mt-auto pt-4 border-t border-blue-900/20 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-1.5 bg-blue-950/40 px-3 py-1 rounded-xl border border-blue-900/30 shadow-inner">
          <Phone size={12} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          <span className="font-bold text-slate-350">{user.totalCalls} Calls</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar size={12} />
          <span className="text-[10px]">Active: {formatDate(user.lastActive)}</span>
        </div>
      </div>
    </button>
  );
}