"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import ChartCard from "./ChartCard";
import { usePersonaDistribution } from "@/hooks/usePersonaDistribution";
const COLORS = ["#3b82f6", "#14b8a6", "#f97316", "#facc15", "#8b5cf6"];
export default function PersonaDonutChart() {
  const { data, isLoading } = usePersonaDistribution();

  if (isLoading) {
    return <ChartCard title="Calls By Persona">Loading...</ChartCard>;
  }

  return (
    <ChartCard title="Calls By Persona">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data || []}
            dataKey="value"
            nameKey="name"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={12}
            cornerRadius={20}
          >
            {(data || []).map((_: any, index: number) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
