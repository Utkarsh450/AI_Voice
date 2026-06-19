"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function UserSearch({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-slate-500
      "
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search users..."
        className="
        w-full
        rounded-2xl
        border border-slate-800
        bg-slate-900
        py-4
        pl-12
        pr-4
        outline-none
      "
      />
    </div>
  );
}
