"use client";

import { useState } from "react";
import { useVoiceRoom } from "../../hooks/useVoiceRoom";
import { useRealtimeCall } from "@/hooks/useRealTimeCall";
import { sessionService } from "@/services/session.service";
import { useQueryClient } from "@tanstack/react-query";

import SessionHeader from "./SessionHeader";
import ActiveCallPanel from "./ActiveCallPanel";
import CallControls from "./CallControls";

interface Props {
  sessionId: number | null;
  setSelectedSessionId: (id: number) => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

export default function ChatPanel({
  sessionId,
  setSelectedSessionId,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeft,
  onToggleRight,
}: Props) {
  const { connected, connect, disconnect, isMuted, toggleMute, connecting, agentConnected } = useVoiceRoom();

  const { transcript, state } = useRealtimeCall(sessionId);

  const [callerId, setCallerId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("caller_id") || "test-user";
    }
    return "test-user";
  });

  const [persona, setPersona] = useState("default");
  const [showSettings, setShowSettings] = useState(false);

  const updateCallerId = (val: string) => {
    setCallerId(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("caller_id", val);
    }
  };

  const immersive = !leftSidebarOpen && !rightSidebarOpen;

  const queryClient = useQueryClient();
  const handleStartCall = async () => {
    let id = sessionId;

    if (!id) {
      const session = await sessionService.createSession(callerId, persona);
      if (session && typeof session.id === "number") {
        id = session.id;
        setSelectedSessionId(session.id);
        queryClient.invalidateQueries({
          queryKey: ["sessions"],
        });
      }
    }

    if (id) {
      await connect(id);
    }
  };
  console.log("SESSION ID:", sessionId);

  return (
    <section className="flex flex-1 overflow-hidden bg-slate-950 flex-col justify-between">
      <div
        className={`
          flex min-w-0 flex-1 flex-col
          transition-all duration-500
          ${immersive ? "justify-center" : ""}
        `}
      >
        <SessionHeader
          sessionId={sessionId}
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
          onToggleLeft={onToggleLeft}
          onToggleRight={onToggleRight}
        />

        <ActiveCallPanel
          immersive={immersive}
          state={connected ? state : "idle"}
          transcript={transcript}
          connecting={connecting}
          connected={connected}
          agentConnected={agentConnected}
        />

        {/* CALL CONFIGURATIONS */}
        {(!connected || showSettings) && (
          <div className="max-w-xl mx-auto w-full px-8 mb-4 animate-fadeIn">
            <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                Call Configurations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Caller ID / Username
                  </label>
                  <input
                    type="text"
                    value={callerId}
                    onChange={(e) => updateCallerId(e.target.value)}
                    placeholder="Enter Caller ID..."
                    className="w-full px-4 py-2.5 text-sm bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select Agent Persona
                  </label>
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                  >
                    <option value="default">Default Assistant</option>
                    <option value="sales">Sales Agent</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Finance</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <CallControls
          connected={connected}
          onConnect={handleStartCall}
          onDisconnect={disconnect}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onToggleSettings={() => setShowSettings(!showSettings)}
          showSettings={showSettings}
        />
      </div>
    </section>
  );
}
