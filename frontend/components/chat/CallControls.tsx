"use client";

import { Mic, MicOff, PhoneOff, MoreHorizontal, Phone } from "lucide-react";

interface Props {
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleSettings: () => void;
  showSettings: boolean;
}

export default function CallControls({
  connected,
  onConnect,
  onDisconnect,
  isMuted,
  onToggleMute,
  onToggleSettings,
  showSettings,
}: Props) {
  if (!connected) {
    return (
      <div className="flex items-center justify-center py-6">
        <button
          onClick={onConnect}
          className="
            flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600
            px-7 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg
            shadow-orange-500/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-orange-500/20 cursor-pointer
          "
        >
          <Phone size={14} className="animate-pulse" />
          Start Call
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 py-6 border-t border-slate-900 bg-slate-950/20">
      {/* Left button: Mic toggle */}
      <button
        onClick={onToggleMute}
        className={`
          flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer
          ${
            isMuted
              ? "bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800"
          }
        `}
        title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      {/* Center button: Hangup */}
      <button
        onClick={onDisconnect}
        className="
          flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/15 text-red-400
          transition-all duration-300 hover:scale-[1.02] hover:bg-red-500/25 hover:border-red-500/60 cursor-pointer
          shadow-lg shadow-red-500/5
        "
        title="End Call"
      >
        <PhoneOff size={20} />
      </button>

      {/* Right button: Settings dropdown toggle */}
      <button
        onClick={onToggleSettings}
        className={`
          flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer
          ${
            showSettings
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800"
          }
        `}
        title="Toggle Configurations"
      >
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}