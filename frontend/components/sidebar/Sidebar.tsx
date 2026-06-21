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
        border-r border-slate-900
        bg-slate-950/90
        backdrop-blur-xl
        overflow-hidden
        transition-all
        duration-300
        flex flex-col
        ${open ? "w-[340px]" : "w-20"}
      `}
    >
      <div className="border-b border-slate-900 px-5 py-5">
        <div className="flex items-center justify-between">
          {open && (
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight">Voice Agent</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Call Center playground</p>
            </div>
          )}

          <button
            onClick={onToggle}
            className="
              rounded-xl
              border border-slate-900
              p-2
              text-slate-400
              transition-all
              hover:bg-slate-900
              hover:text-white
              cursor-pointer
            "
          >
            <PanelLeftClose size={16} />
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
            from-orange-500
            to-amber-600
            px-4 py-3
            font-bold
            text-xs
            uppercase
            tracking-wider
            shadow-lg
            shadow-orange-500/10
            transition-all
            hover:scale-[1.01]
            hover:shadow-orange-500/20
            cursor-pointer
            text-white
          "
        >
          <Plus size={16} />
          {open && "New Call Session"}
        </button>

        {open && (
          <div className="mt-4">
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
