"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Food } from "@/lib/types";
import { ZONE_META, CAT_META } from "@/lib/types";

interface Props {
  food: Food | null;
  onClose: () => void;
  onCompare: (food: Food) => void;
  inCompare: boolean;
}

const chartConfig = {
  value: { label: "%", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function DetailModal({ food, onClose, onCompare, inCompare }: Props) {
  const open = food !== null;
  if (!food) return null;

  const z = ZONE_META[food.zone];
  const catColor = CAT_META[food.category].color;
  const gramsFor100 = food.calDensity > 0 ? `${Math.round(100 / food.calDensity)}g` : "∞";

  const radarData = [
    { axis: "Protein", value: Math.round(food.proteinPct) },
    { axis: "Density", value: Math.round(Math.min(food.calDensity / 8, 1) * 100) },
    { axis: "Carbs", value: Math.round(food.carbPct) },
    { axis: "Fat", value: Math.round(food.fatPct) },
  ];

  const stats: [string, string][] = [
    ["Per 100 kcal", gramsFor100],
    ["Typical portion", `${food.avgPortion.toFixed(0)}g`],
    ["Times eaten", `${food.timesEaten}×`],
    ["Month total", `${food.totalCalories.toLocaleString()} kcal`],
    ["Total consumed", `${Math.round(food.totalWeight)}g`],
    ["Zone", z.label],
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex gap-2">
            <Badge style={{ backgroundColor: z.fill }}>{z.label} density</Badge>
            <Badge variant="outline" style={{ color: catColor, borderColor: catColor }}>
              {CAT_META[food.category].label}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{food.name}</DialogTitle>
        </DialogHeader>

        {/* Density hero */}
        <div
          className="rounded-lg border-l-4 p-4"
          style={{ backgroundColor: z.light, borderColor: z.fill }}
        >
          <div className="text-xs uppercase tracking-wide" style={{ color: z.fill }}>
            Caloric density
          </div>
          <div className="text-4xl font-bold tabular-nums">
            {food.calDensity.toFixed(2)}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">kcal/g</span>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(([label, val]) => (
            <div key={label} className="border-t-2 pt-2" style={{ borderColor: z.fill }}>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
              <div className="text-sm font-semibold tabular-nums">{val}</div>
            </div>
          ))}
        </div>

        {/* Macro radar */}
        <div className="rounded-lg border p-3">
          <div className="mb-1 text-center text-xs uppercase tracking-wide text-muted-foreground">
            Macro profile
          </div>
          <ChartContainer config={chartConfig} className="mx-auto h-[220px] w-full max-w-[300px]">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
              <Radar
                dataKey="value"
                fill={catColor}
                fillOpacity={0.3}
                stroke={catColor}
                strokeWidth={2}
                dot={{ r: 3, fill: catColor }}
              />
            </RadarChart>
          </ChartContainer>
          <div className="mt-1 flex justify-center gap-4 text-xs text-muted-foreground">
            <span>P {food.proteinPer100g.toFixed(1)}g</span>
            <span>F {food.fatPer100g.toFixed(1)}g</span>
            <span>C {food.carbPer100g.toFixed(1)}g</span>
            <span>· per 100g</span>
          </div>
        </div>

        <Button
          className="w-full"
          variant={inCompare ? "secondary" : "default"}
          onClick={() => { onCompare(food); onClose(); }}
        >
          {inCompare ? "✓ In comparison" : "+ Add to comparison"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
