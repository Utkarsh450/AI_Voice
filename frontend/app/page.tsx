"use client";

import { useState, useEffect } from "react";

import Sidebar from "../components/sidebar/Sidebar";
import ChatPanel from "../components/chat/ChatPanel";
import SessionDetailsSidebar from "../components/session/SessionDetailsSidebar";
import { useAdminStats } from "@/hooks/useAdminStats";

export default function HomePage() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const { data, isLoading } = useAdminStats();

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Responsive sidebar auto-collapse on small screens
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        if (window.innerWidth < 1024) {
          setLeftSidebarOpen(false);
          setRightSidebarOpen(false);
        } else {
          setLeftSidebarOpen(true);
          setRightSidebarOpen(true);
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

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
        onToggleLeft={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onToggleRight={() => setRightSidebarOpen(!rightSidebarOpen)}
      />

      <SessionDetailsSidebar
        sessionId={selectedSessionId}
        open={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
      />
    </main>
  );
}
