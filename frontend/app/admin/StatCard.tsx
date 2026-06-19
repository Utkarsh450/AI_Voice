import GlassCard from "./GlassCard";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
}: Props) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h3 className="mt-5 text-4xl font-bold text-white">
            {value}
          </h3>
        </div>

        <div
          className="
          rounded-2xl
          bg-blue-500/10
          p-3
          text-blue-400
        "
        >
          <Icon size={22} />
        </div>
      </div>
    </GlassCard>
  );
}