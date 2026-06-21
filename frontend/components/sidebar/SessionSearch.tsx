import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SessionSearch({ value, onChange }: Props) {
  return (
    <div className="relative group w-full">
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors duration-300"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search calls..."
        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/20 border border-slate-900 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 transition-all duration-300 shadow-inner"
      />
    </div>
  );
}