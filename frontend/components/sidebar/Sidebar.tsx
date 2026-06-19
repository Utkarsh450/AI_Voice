"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, PanelLeftClose } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { sessionService } from "@/services/session.service";

import { Session } from "@/types/session";
import SessionCard from "./SessionCard";
import SessionSearch from "./SessionSearch";
import { useSessions } from "../../hooks/useSessions";

interface Props {
  open: boolean;
  onToggle: () => void;
  // connected: boolean;

  selectedSessionId: number | null;

  setSelectedSessionId: (id: number) => void;
}

export default function Sidebar({
  open,
  onToggle,
  // connected,
  selectedSessionId,
  setSelectedSessionId,
}: Props) {
  const { data, isLoading } = useSessions();

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();

  const handleNewSession = async () => {
    const session = await sessionService.createSession();

    setSelectedSessionId(session.id);

    queryClient.invalidateQueries({
      queryKey: ["sessions"],
    });
  };

  // useEffect(() => {
  //   if (
  //     connected &&
  //     !selectedSessionId &&
  //     data?.length
  //   ) {
  //     setSelectedSessionId(
  //       data[0].id
  //     );
  //   }
  // }, [
  //   connected,
  //   data,
  //   selectedSessionId,
  //   setSelectedSessionId,
  // ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredSessions = useMemo(() => {
    if (!data) return [];

    const q = debouncedSearch.trim().toLowerCase();

    if (!q) return data;

    return data.filter((session: Session) => {
      return (
        session.roomName?.toLowerCase().includes(q) ||
        session.participantIdentity?.toLowerCase().includes(q)
      );
    });
  }, [data, debouncedSearch]);

  return (
    <aside
      className={`
        border-r border-slate-800
        bg-slate-900/70
        backdrop-blur-xl
        overflow-hidden
        transition-all
        duration-300
        flex flex-col
        ${open ? "w-[340px]" : "w-24"}
      `}
    >
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between">
          {open && (
            <div>
              <h1 className="text-xl font-bold text-white">Voice AI</h1>

              <p className="text-sm text-slate-400">AI Conversations</p>
            </div>
          )}

          <button
            onClick={onToggle}
            className="
      rounded-xl
      border border-slate-800
      p-2
      text-slate-400
      transition
      hover:bg-slate-800
      hover:text-white
    "
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <button
          onClick={handleNewSession}
          className="
mt-5
flex w-full
items-center justify-center
gap-2
rounded-2xl
bg-gradient-to-r
from-blue-600
to-indigo-600
px-4 py-3
font-medium
shadow-lg
shadow-blue-500/20
transition
hover:scale-[1.02]
"
        >
          <Plus size={18} />

          {open && "New Session"}
        </button>

        {open && (
          <div className="mt-5">
            <SessionSearch value={search} onChange={setSearch} />
          </div>
        )}
      </div>

      <div
        className={`flex-1
    overflow-y-auto
    ${open ? "space-y-3 p-6" : "space-y-6 py-6 flex flex-col items-center"}
  `}
      >
        {isLoading && <p className="text-slate-400">Loading...</p>}
        {open && filteredSessions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today
            </p>
          </div>
        )}

        {filteredSessions.map((session: Session) => (
          <SessionCard
            key={session.id}
            session={session}
            compact={!open}
            selected={selectedSessionId === session.id}
            onClick={() => {
              console.log("CLICKED:", session.id);
              setSelectedSessionId(session.id);
            }}
          />
        ))}
      </div>
    </aside>
  );
}
