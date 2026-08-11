"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  CHART_TOOLTIP_DEFAULTS,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Food, Zone } from "@/lib/types";
import { ZONE_META } from "@/lib/types";

const MAX_DENSITY = 8;

const chartConfig = {
  low: { label: "Low", color: ZONE_META.low.fill },
  medium: { label: "Medium", color: ZONE_META.medium.fill },
  high: { label: "High", color: ZONE_META.high.fill },
} satisfies ChartConfig;

const QUADRANTS = [
  { title: "Hidden calories", desc: "High density, small portion. Butter, gummies, condensed milk." },
  { title: "Real danger", desc: "High density AND large portion. The most impactful in your diet." },
  { title: "Safe zone", desc: "Low density, small portion. No concern." },
  { title: "High volume", desc: "Low density but you eat a lot. Sweet Potato, Banana, Greek Yogurt." },
];

function ScatterTooltip({
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
        {f.calDensity.toFixed(2)} kcal/g · {f.avgPortion.toFixed(0)}g/serving
      </div>
      <div className="text-muted-foreground">
        {f.timesEaten}× eaten · {f.totalCalories.toLocaleString()} kcal total
      </div>
      <div className="text-muted-foreground/70">Click for details →</div>
    </div>
  );
}

export function ScatterView({ foods, onSelect }: { foods: Food[]; onSelect: (f: Food) => void }) {
  const byZone = (zone: Zone) => foods.filter((f) => f.zone === zone);

  const maxPortion = useMemo(() => {
    const peak = foods.reduce((max, f) => (f.avgPortion > max ? f.avgPortion : max), 0);
    return Math.max(160, Math.ceil(peak / 50) * 50);
  }, [foods]);

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[420px] w-full">
        <ScatterChart margin={{ top: 24, right: 24, bottom: 16, left: 0 }}>
          {/* Quadrant backgrounds */}
          <ReferenceArea x1={0} x2={150} y1={1.5} y2={MAX_DENSITY} fill={ZONE_META.high.fill} fillOpacity={0.08} />
          <ReferenceArea x1={150} x2={maxPortion} y1={1.5} y2={MAX_DENSITY} fill={ZONE_META.high.fill} fillOpacity={0.16} />
          <ReferenceArea x1={0} x2={150} y1={0} y2={1.5} fill={ZONE_META.low.fill} fillOpacity={0.08} />
          <ReferenceArea x1={150} x2={maxPortion} y1={0} y2={1.5} fill={ZONE_META.medium.fill} fillOpacity={0.08} />

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="avgPortion"
            domain={[0, maxPortion]}
            tickCount={9}
            tickLine={false}
            axisLine={false}
            label={{ value: "AVERAGE PORTION (g)", position: "insideBottom", offset: -8, fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="calDensity"
            domain={[0, MAX_DENSITY]}
            tickCount={9}
            tickLine={false}
            axisLine={false}
            label={{ value: "DENSITY (kcal/g)", angle: -90, position: "insideLeft", fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="timesEaten" range={[60, 400]} />

          <ChartTooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} {...CHART_TOOLTIP_DEFAULTS} />

          {/* Quadrant dividers */}
          <ReferenceLine x={150} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="5 3"
            label={{ value: "HIDDEN CALORIES", position: "insideTopLeft", fontSize: 9, fill: ZONE_META.high.fill }} />
          <ReferenceLine y={1.5} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="5 3" />

          {(Object.keys(ZONE_META) as Zone[]).map((zone) => (
            <Scatter
              key={zone}
              name={chartConfig[zone].label}
              data={byZone(zone)}
              fill={ZONE_META[zone].fill}
              fillOpacity={0.75}
              onClick={(data) => {
                const food = (data as unknown as { payload?: Food }).payload ?? (data as unknown as Food);
                if (food && "name" in food) onSelect(food);
              }}
              cursor="pointer"
            />
          ))}
        </ScatterChart>
      </ChartContainer>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>● size = frequency</span>
        {(Object.entries(ZONE_META) as [Zone, (typeof ZONE_META)[Zone]][]).map(([k, v]) => (
          <span key={k}>
            <span style={{ color: v.fill }}>●</span> {v.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {QUADRANTS.map((q) => (
          <div key={q.title} className="rounded-lg border p-3">
            <div className="mb-1 text-xs font-semibold">{q.title}</div>
            <div className="text-xs leading-relaxed text-muted-foreground">{q.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
