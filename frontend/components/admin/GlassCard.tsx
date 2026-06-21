interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({
  children,
  className = "hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)]",
}: Props) {
  return (
    <div
      className={`
        rounded-[24px]
        border border-blue-900/30
        bg-blue-950/15
        p-6
        backdrop-blur-2xl
        transition-all
        duration-300
        hover:bg-blue-950/20
        shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        \${className}
      `}
    >
      {children}
    </div>
  );
}