import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

type StatColor = "blue" | "emerald" | "violet" | "amber" | "rose" | "indigo" | "sky" | "pink";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: StatColor;
}

const colorMap: Record<StatColor, { iconBg: string; hover: string }> = {
  blue: {
    iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    hover: "hover:border-blue-500/30 hover:shadow-blue-500/5",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    hover: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
  },
  violet: {
    iconBg: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    hover: "hover:border-violet-500/30 hover:shadow-violet-500/5",
  },
  amber: {
    iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    hover: "hover:border-amber-500/30 hover:shadow-amber-500/5",
  },
  rose: {
    iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    hover: "hover:border-rose-500/30 hover:shadow-rose-500/5",
  },
  indigo: {
    iconBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    hover: "hover:border-indigo-500/30 hover:shadow-indigo-500/5",
  },
  sky: {
    iconBg: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    hover: "hover:border-sky-500/30 hover:shadow-sky-500/5",
  },
  pink: {
    iconBg: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    hover: "hover:border-pink-500/30 hover:shadow-pink-500/5",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = "blue",
}: Props) {
  const styles = colorMap[color] || colorMap.blue;

  return (
    <GlassCard className={`${styles.hover} transition-all duration-300 transform hover:-translate-y-1.5`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {title}
          </p>

          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight leading-none">
            {value}
          </h2>

          {description && (
            <p className="text-[11px] text-slate-400/90 font-normal leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className={`rounded-xl p-2.5 ${styles.iconBg} transition-transform duration-300 hover:rotate-6`}>
          <Icon size={18} />
        </div>
      </div>
    </GlassCard>
  );
}