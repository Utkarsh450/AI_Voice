"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function UserSearch({ value, onChange }: Props) {
  return (
    <div className="relative group w-full">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search users by name or ID..."
        className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-inner"
      />
    </div>
  );
}
