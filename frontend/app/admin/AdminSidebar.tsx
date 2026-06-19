"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Phone,
  Users,
  BookOpen,
  Bot,
  BarChart3,
  Settings,
} from "lucide-react";

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

export default function AdminSidebar() {
  return (
    <aside className="w-[280px] relative border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold">
          🎙 VoiceAI
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          AI Call Center Platform
        </p>
      </div>

      <nav className="space-y-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="
                flex items-center gap-3
                rounded-2xl
                px-4 py-3
                text-slate-300
                transition
                hover:bg-slate-900
                hover:text-white
              "
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          System Healthy
        </div>
      </div>
    </aside>
  );
}