"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Food } from "@/lib/types";
import { ZONE_META } from "@/lib/types";

const chartConfig = {
  totalCalories: { label: "total kcal", color: "var(--chart-1)" },
} satisfies ChartConfig;

function RankingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Food }[];
}) {
  if (!active || !payload?.length) return null;
  const f = payload[0].payload;
  return (
    <div className="grid min-w-44 gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{f.name}</div>
      <div className="text-muted-foreground">
        {f.totalCalories.toLocaleString()} total kcal
      </div>
      <div className="text-muted-foreground">
        {f.avgPortion.toFixed(0)}g/serving · {f.timesEaten}× eaten
      </div>
      <div className="text-muted-foreground/70">Click for details →</div>
    </div>
  );
}

export function RankingView({ foods, onSelect }: { foods: Food[]; onSelect: (f: Food) => void }) {
  const top = useMemo(
    () => [...foods].sort((a, b) => b.totalCalories - a.totalCalories).slice(0, 30),
    [foods]
  );

  const rowHeight = 30;
  const height = Math.max(240, top.length * rowHeight + 24);

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ height }}
    >
      <BarChart data={top} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v: number) => v.toLocaleString()} />
        <YAxis
          type="category"
          dataKey="name"
          width={180}
          tickLine={false}
          axisLine={false}
          interval={0}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<RankingTooltip />} cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }} />
        <Bar
          dataKey="totalCalories"
          radius={[0, 3, 3, 0]}
          onClick={(data) => {
            const food = (data as unknown as { payload?: Food }).payload;
            if (food) onSelect(food);
          }}
          cursor="pointer"
        >
          {top.map((f) => (
            <Cell key={f.name} fill={ZONE_META[f.zone].fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
