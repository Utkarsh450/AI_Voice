interface Props {
  delay: number;
}

export default function WaveRing({
  delay,
}: Props) {
  return (
    <div
      className="absolute h-56 w-56 rounded-full border border-blue-500/30 animate-ping"
      style={{
        animationDelay:
          `${delay}ms`,
      }}
    />
  );
}