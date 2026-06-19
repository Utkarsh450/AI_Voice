"use client";

import {
  Database,
  Radio,
  Wifi,
  Brain,
  Server,
} from "lucide-react";

import { useSystemHealth } from "@/hooks/useSystemHealth";

function Status({
  label,
  value,
  icon,
}: {
  label: string;
  value: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="
      flex items-center
      justify-between
      rounded-2xl
      border border-slate-800
      bg-slate-900/40
      p-4
    "
    >
      <div className="flex items-center gap-3">
        {icon}

        <span className="text-sm text-slate-300">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            value
              ? "bg-emerald-500"
              : "bg-red-500"
          }`}
        />

        <span
          className={`text-xs font-medium ${
            value
              ? "text-emerald-400"
              : "text-red-400"
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
    <div
      className="
      rounded-3xl
      border border-slate-800
      bg-slate-900/40
      p-6
    "
    >
      <h3 className="text-lg font-semibold">
        System Health
      </h3>

      {isLoading ? (
        <div className="mt-6 text-slate-400">
          Loading...
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <Status
            label="PostgreSQL"
            value={data?.postgres}
            icon={
              <Database
                size={18}
              />
            }
          />

          <Status
            label="Worker"
            value={data?.worker}
            icon={
              <Server
                size={18}
              />
            }
          />

          <Status
            label="LiveKit"
            value={data?.livekit}
            icon={
              <Radio
                size={18}
              />
            }
          />

          <Status
            label="WebSocket"
            value={data?.websocket}
            icon={
              <Wifi
                size={18}
              />
            }
          />

          <Status
            label="Groq"
            value={data?.groq}
            icon={
              <Brain
                size={18}
              />
            }
          />
        </div>
      )}
    </div>
  );
}