"use client";

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
  type ChartConfig,
} from "@/components/ui/chart";
import type { Food, Zone } from "@/lib/types";
import { ZONE_META } from "@/lib/types";

const MAX_DENSITY = 8;
const MAX_PORTION = 800;

const chartConfig = {
  low: { label: "Baja", color: ZONE_META.low.fill },
  medium: { label: "Media", color: ZONE_META.medium.fill },
  high: { label: "Alta", color: ZONE_META.high.fill },
} satisfies ChartConfig;

const QUADRANTS = [
  { title: "Calorías ocultas", desc: "Alta densidad, porción pequeña. Mantequilla, gummies, condensed milk." },
  { title: "Peligro real", desc: "Alta densidad Y porción grande. Los más impactantes de tu dieta." },
  { title: "Zona segura", desc: "Baja densidad, porción pequeña. Sin preocupación." },
  { title: "Volumen alto", desc: "Baja densidad pero comes mucho. Sweet Potato, Banana, Greek Yogurt." },
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
        {f.calDensity.toFixed(2)} kcal/g · {f.avgPortion.toFixed(0)}g/vez
      </div>
      <div className="text-muted-foreground">
        {f.timesEaten}× comido · {f.totalCalories.toLocaleString()} kcal total
      </div>
      <div className="text-muted-foreground/70">Clic para detalle →</div>
    </div>
  );
}

export function ScatterView({ foods, onSelect }: { foods: Food[]; onSelect: (f: Food) => void }) {
  const byZone = (zone: Zone) => foods.filter((f) => f.zone === zone);

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[420px] w-full">
        <ScatterChart margin={{ top: 24, right: 24, bottom: 16, left: 0 }}>
          {/* Quadrant backgrounds */}
          <ReferenceArea x1={0} x2={150} y1={1.5} y2={MAX_DENSITY} fill={ZONE_META.high.fill} fillOpacity={0.08} />
          <ReferenceArea x1={150} x2={MAX_PORTION} y1={1.5} y2={MAX_DENSITY} fill={ZONE_META.high.fill} fillOpacity={0.16} />
          <ReferenceArea x1={0} x2={150} y1={0} y2={1.5} fill={ZONE_META.low.fill} fillOpacity={0.08} />
          <ReferenceArea x1={150} x2={MAX_PORTION} y1={0} y2={1.5} fill={ZONE_META.medium.fill} fillOpacity={0.08} />

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="avgPortion"
            domain={[0, MAX_PORTION]}
            tickCount={9}
            tickLine={false}
            axisLine={false}
            label={{ value: "PORCIÓN PROMEDIO (g)", position: "insideBottom", offset: -8, fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="calDensity"
            domain={[0, MAX_DENSITY]}
            tickCount={9}
            tickLine={false}
            axisLine={false}
            label={{ value: "DENSIDAD (kcal/g)", angle: -90, position: "insideLeft", fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="timesEaten" range={[60, 400]} />

          <ChartTooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />

          {/* Quadrant dividers */}
          <ReferenceLine x={150} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="5 3"
            label={{ value: "CALORÍAS OCULTAS", position: "insideTopLeft", fontSize: 9, fill: ZONE_META.high.fill }} />
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
        <span>● tamaño = frecuencia</span>
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
