"use client";

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
}

export default function ChatPanel({
  sessionId,
  setSelectedSessionId,
  leftSidebarOpen,
  rightSidebarOpen,
}: Props) {
  const { connected, connect, disconnect } = useVoiceRoom();

  const { transcript, state } = useRealtimeCall(sessionId);

  const immersive = !leftSidebarOpen && !rightSidebarOpen;

  const queryClient = useQueryClient();
  const handleStartCall = async () => {
    let id = sessionId;

    if (!id) {
      const session = await sessionService.createSession();

      id = session.id;

      setSelectedSessionId(id);

      queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });
    }

    await connect(id);
  };
  console.log("SESSION ID:", sessionId);

  return (
    <section className="flex flex-1 overflow-hidden bg-slate-950">
      <div
        className={`
          flex min-w-0 flex-1 flex-col
          transition-all duration-500
          ${immersive ? "justify-center" : ""}
        `}
      >
        <SessionHeader sessionId={sessionId} />

        <ActiveCallPanel
          immersive={immersive}
          state={connected ? state : "idle"}
          transcript={transcript}
        />

        <CallControls
          connected={connected}
          onConnect={handleStartCall}
          onDisconnect={disconnect}
        />
      </div>
    </section>
  );
}
