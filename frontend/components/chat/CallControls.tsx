"use client";

import {
  Phone,
  PhoneOff,
} from "lucide-react";

interface Props {
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function CallControls({
  connected,
  onConnect,
  onDisconnect,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      {!connected ? (
        <button
          onClick={onConnect}
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium transition hover:bg-emerald-500"
        >
          <Phone size={18} />
          Start Call
        </button>
      ) : (
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium transition hover:bg-red-500"
        >
          <PhoneOff size={18} />
          End Call
        </button>
      )}
    </div>
  );
}