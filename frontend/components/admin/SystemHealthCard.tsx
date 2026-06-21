"use client";

import {
  Database,
  Radio,
  Wifi,
  Brain,
  Server,
  Activity,
} from "lucide-react";
import GlassCard from "./GlassCard";
import { useSystemHealth } from "@/hooks/useSystemHealth";

interface StatusProps {
  label: string;
  value: boolean;
  icon: React.ReactNode;
  colorClass: string;
}

function Status({
  label,
  value,
  icon,
  colorClass,
}: StatusProps) {
  return (
    <div
      className="
      flex items-center
      justify-between
      rounded-2xl
      border border-blue-900/20
      bg-blue-950/20
      p-3 shadow-inner
      transition-all duration-300
      hover:bg-blue-950/30 hover:border-blue-900/40
    "
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-blue-950/40 border border-blue-900/30 ${colorClass} shadow-md`}>
          {icon}
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          {value ? (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          ) : (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              value
                ? "bg-emerald-500"
                : "bg-rose-500"
            }`}
          />
        </span>

        <span
          className={`text-xs font-semibold tracking-wide uppercase ${
            value
              ? "text-emerald-400"
              : "text-rose-400"
          }`}
        >
          {value
            ? "Online"
            : "Offline"}
        </span>
      </div>
    </div>
  );
}

export default function SystemHealthCard() {
  const {
    data,
    isLoading,
  } =
    useSystemHealth();

  return (
    <GlassCard className="hover:border-blue-900/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            System Health
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time gateway &amp; service logs</p>
        </div>
        {isLoading ? (
          <span className="text-xs text-slate-500">Checking...</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Live
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center text-slate-400">
          <div className="animate-pulse flex items-center gap-2">
            <Activity className="animate-spin text-blue-400" size={16} />
            Testing connections...
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Status
            label="PostgreSQL"
            value={!!data?.postgres}
            icon={
              <Database
                size={16}
              />
            }
            colorClass="text-blue-400"
          />

          <Status
            label="Worker"
            value={!!data?.worker}
            icon={
              <Server
                size={16}
              />
            }
            colorClass="text-violet-400"
          />

          <Status
            label="LiveKit"
            value={!!data?.livekit}
            icon={
              <Radio
                size={16}
              />
            }
            colorClass="text-indigo-400"
          />

          <Status
            label="WebSocket"
            value={!!data?.websocket}
            icon={
              <Wifi
                size={16}
              />
            }
            colorClass="text-sky-400"
          />

          <Status
            label="Groq Llama 3.3"
            value={!!data?.groq}
            icon={
              <Brain
                size={16}
              />
            }
            colorClass="text-pink-400"
          />
        </div>
      )}
    </GlassCard>
  );
}