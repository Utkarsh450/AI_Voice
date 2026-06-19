"use client";

import { useState } from "react";

import Sidebar from "../components/sidebar/Sidebar";
import ChatPanel from "../components/chat/ChatPanel";

import SessionDetailsSidebar from "../components/session/SessionDetailsSidebar";


import { useAdminStats } from "@/hooks/useAdminStats";  
export default function HomePage() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const { data, isLoading } = useAdminStats();

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <main className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar
        open={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        selectedSessionId={selectedSessionId}
        setSelectedSessionId={setSelectedSessionId}
      />

      <ChatPanel
        sessionId={selectedSessionId}
        setSelectedSessionId={setSelectedSessionId}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
      />

      <SessionDetailsSidebar
        sessionId={selectedSessionId}
        open={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
      />
    </main>
  );
}
