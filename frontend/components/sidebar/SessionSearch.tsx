import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SessionSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search sessions..."
        className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500"
      />
    </div>
  );
}