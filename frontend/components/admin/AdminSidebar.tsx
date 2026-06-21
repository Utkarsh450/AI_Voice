"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  Users,
  BookOpen,
  Bot,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { useSystemHealth } from "@/hooks/useSystemHealth";

const items = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Sessions",
    href: "/admin/sessions",
    icon: Phone,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Knowledge",
    href: "/admin/knowledge",
    icon: BookOpen,
  },
  {
    name: "Personas",
    href: "/admin/personas",
    icon: Bot,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { data: healthData, isLoading: isHealthLoading } = useSystemHealth();

  // Calculate health metrics dynamically
  const onlineCount = healthData
    ? Object.values(healthData).filter(Boolean).length
    : 0;
  const totalCount = healthData ? Object.keys(healthData).length : 5;
  const isHealthy = onlineCount === totalCount;
  const isOutage = onlineCount === 0;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-blue-900/30 bg-[#030712]/95 backdrop-blur-2xl transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        \${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex items-center justify-between border-b border-blue-900/30 p-6 bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Phone size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">VoiceAI</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Control Center</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden rounded-xl border border-slate-900 p-2 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3.5
                rounded-xl
                px-6 py-5 relative overflow-hidden
                transition-all duration-300 group
                \${
                  isActive
                    ? "bg-blue-900/30 hover:bg-blue-900/10 text-blue-400 border-none font-bold"
                    : "text-slate-400 hover:bg-slate-900/10 hover:text-slate-200"
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-md" />
              )}
              <Icon size={18} className={`transition-transform duration-300 group-hover:scale-105 \${isActive ? "text-blue-400" : "text-slate-500"}`} />
              <span className="text-sm font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-blue-900/30 bg-slate-950/10">
        <div className="rounded-2xl border border-blue-900/30 bg-blue-950/20 p-4 shadow-inner">
          <div className="flex items-center gap-3 text-xs font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              {isHealthy && !isHealthLoading && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              {!isHealthy && !isOutage && !isHealthLoading && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              {isOutage && !isHealthLoading && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHealthLoading
                    ? "bg-slate-600"
                    : isHealthy
                    ? "bg-emerald-500"
                    : isOutage
                    ? "bg-rose-500"
                    : "bg-amber-500"
                }`}
              />
            </span>
            <span className="font-medium text-slate-300">
              {isHealthLoading
                ? "Monitoring services..."
                : isHealthy
                ? `System Healthy (${onlineCount}/${totalCount})`
                : isOutage
                ? `System Outage (${onlineCount}/${totalCount} Online)`
                : `Degraded (${onlineCount}/${totalCount} Online)`}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}