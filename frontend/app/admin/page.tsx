"use client";

import StatCard from "../../components/admin/StatCard";
import CallsAreaChart from "../../components/admin/CallAreaCharts";
import PersonaDonutChart from "../../components/admin/PersonaDonutChart";
import RecentSessionsTable from "../../components/admin/RecentSessionTable";
import TopUsersCard from "../../components/admin/TopUsersCard";
import SystemHealthCard from "../../components/admin/SystemHealthCard";
import GlassCard from "../../components/admin/GlassCard";

import {
  Phone,
  Users,
  FileText,
  Bot,
  Timer,
  Activity,
  CheckCircle2,
  Play,
  Upload,
  Search,
} from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import Link from "next/link";

function QuickActionsCard() {
  const actions = [
    {
      name: "Start Call",
      href: "/sessions",
      desc: "Connect to live agent",
      icon: Play,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Upload Docs",
      href: "/admin/knowledge",
      desc: "Add files to RAG base",
      icon: Upload,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "Edit Personas",
      href: "/admin/personas",
      desc: "Customize AI agents",
      icon: Bot,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      name: "Manage Users",
      href: "/admin/users",
      desc: "Explore user memory",
      icon: Search,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <GlassCard className="hover:border-slate-800">
      <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.name}
              href={act.href}
              className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-800 bg-slate-950/30 transition-all hover:bg-slate-900 hover:border-slate-700 group cursor-pointer"
            >
              <div className={`p-2.5 rounded-xl border ${act.color} transition-transform group-hover:scale-105`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {act.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default function AdminPage() {
  const { data: stats, isLoading } = useAdminStats();

  const formatDuration = (seconds: number | undefined) => {
    if (seconds === undefined || seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Overview */}
      <div className="flex flex-col gap-1 border-b border-blue-900/30 pb-5 animate-fadeIn">
        <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-400 font-medium">
          Overview of your AI Voice Platform and system statistics
        </p>
      </div>

      {/* 8 STATS GRID */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Calls"
          value={isLoading ? "..." : String(stats?.todayCalls ?? 0)}
          icon={Activity}
          description="Calls handled today"
          color="blue"
        />

        <StatCard
          title="Avg Duration"
          value={isLoading ? "..." : formatDuration(stats?.avgDuration)}
          icon={Timer}
          description="Average session length"
          color="sky"
        />

        <StatCard
          title="Success Rate"
          value={isLoading ? "..." : `${stats?.successRate ?? 0}%`}
          icon={CheckCircle2}
          description="Completed call ratio"
          color="emerald"
        />

        <StatCard
          title="Completed Calls"
          value={isLoading ? "..." : String(stats?.completedCalls ?? 0)}
          icon={CheckCircle2}
          description="Successfully finished calls"
          color="indigo"
        />

        <StatCard
          title="Total Calls"
          value={isLoading ? "..." : String(stats?.totalCalls ?? 0)}
          icon={Phone}
          description="All-time call volume"
          color="violet"
        />

        <StatCard
          title="Total Users"
          value={isLoading ? "..." : String(stats?.totalUsers ?? 0)}
          icon={Users}
          description="Unique callers in database"
          color="pink"
        />

        <StatCard
          title="Knowledge Docs"
          value={isLoading ? "..." : String(stats?.totalDocuments ?? 0)}
          icon={FileText}
          description="Uploaded RAG materials"
          color="amber"
        />

        <StatCard
          title="Active Personas"
          value={isLoading ? "..." : String(stats?.totalPersonas ?? 0)}
          icon={Bot}
          description="Configured AI personalities"
          color="rose"
        />
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <CallsAreaChart />
        <PersonaDonutChart />
      </div>

      {/* TABLE */}
      <RecentSessionsTable />

      {/* BOTTOM */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <TopUsersCard />
        <SystemHealthCard />
        <QuickActionsCard />
      </div>
    </div>
  );
}
