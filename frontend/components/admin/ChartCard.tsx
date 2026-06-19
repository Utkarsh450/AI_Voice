import GlassCard from "./GlassCard";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  children,
}: Props) {
  return (
    <GlassCard>
      <h2 className="mb-6 text-lg font-semibold">
        {title}
      </h2>

      {children}
    </GlassCard>
  );
}