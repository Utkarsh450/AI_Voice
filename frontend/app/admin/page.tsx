"use client";

import StatCard from "../../components/admin/StatCard";
import CallsAreaChart from "../../components/admin/CallAreaCharts";
import PersonaDonutChart from "../../components/admin/PersonaDonutChart";
import RecentSessionsTable from "../../components/admin/RecentSessionTable";
import TopUsersCard from "../../components/admin/TopUsersCard";
import SystemHealthCard from "../../components/admin/SystemHealthCard";

import {
  Phone,
  Users,
  FileText,
  Bot,
  Timer,
  Activity,
  Database,
  CheckCircle,
  Server,
} from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";

export default function AdminPage() {
    const {
  data: stats,
  isLoading,
} = useAdminStats();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">Dashboard</h1>

        <p className="mt-2 text-slate-400">Overview of your AI platform</p>
      </div>

      {/* ROW 1 */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
       
       <StatCard
  title="Today's Calls"
  value={
    isLoading
      ? "..."
      : String(
          stats?.todayCalls
        )
  }
  icon={Activity}
/>

<StatCard
  title="Avg Duration"
  value={
    isLoading
      ? "..."
      : `${Math.floor(
          (
            stats?.avgDuration ??
            0
          ) / 60
        )}:${String(
          (
            stats?.avgDuration ??
            0
          ) % 60
        ).padStart(
          2,
          "0"
        )}`
  }
  icon={Timer}
/>

<StatCard
  title="Chunks"
  value="Coming Soon"
  icon={Database}
/>

<StatCard
  title="Success Rate"
  value={
    isLoading
      ? "..."
      : `${
          stats?.successRate
        }%`
  }
  icon={
    CheckCircle
  }
/>
      </div>

      {/* ROW 2 */}
 <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
  <StatCard
    title="Today's Calls"
    value={
      isLoading
        ? "..."
        : String(
            stats?.todayCalls
          )
    }
    icon={Activity}
  />

  <StatCard
    title="Avg Duration"
    value={
      isLoading
        ? "..."
        : `${Math.floor(
            stats?.avgDuration / 60
          )}:${String(
            stats?.avgDuration % 60
          ).padStart(2, "0")}`
    }
    icon={Timer}
  />

  <StatCard
    title="Completed Calls"
    value={
      isLoading
        ? "..."
        : String(
            stats?.completedCalls
          )
    }
    icon={CheckCircle}
  />

  <StatCard
    title="Services Online"
    value="4 / 5"
    icon={Server}
  />
</div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CallsAreaChart />
        <PersonaDonutChart />
      </div>

      {/* TABLE */}
      <RecentSessionsTable />

      {/* BOTTOM */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopUsersCard />
        <SystemHealthCard />
      </div>
    </div>
  );
}
