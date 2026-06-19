interface Props {
  children: React.ReactNode;
}

export default function GlassCard({
  children,
}: Props) {
  return (
    <div
      className="
      rounded-3xl
      border border-slate-800
      bg-slate-900/50
      p-6
      backdrop-blur-xl
      transition-all
      duration-300
      hover:border-blue-500/40
      hover:bg-slate-900/80
      hover:shadow-lg
      hover:shadow-blue-500/10
    "
    >
      {children}
    </div>
  );
}