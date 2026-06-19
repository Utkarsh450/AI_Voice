"use client";

"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import ChartCard from "./ChartCard";
import { useCallsTrend } from "@/hooks/useCallsTrend";

const data = [
  { day: "Mon", calls: 12 },
  { day: "Tue", calls: 18 },
  { day: "Wed", calls: 25 },
  { day: "Thu", calls: 20 },
  { day: "Fri", calls: 31 },
  { day: "Sat", calls: 26 },
  { day: "Sun", calls: 40 },
];

export default function CallsAreaChart() {
  const { data, isLoading } = useCallsTrend();

  if (isLoading) {
    return <ChartCard title="Calls Trend">Loading...</ChartCard>;
  }

  return (
    <ChartCard title="Calls Trend">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data || []}>
          <CartesianGrid stroke="#1e293b" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="calls"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
