"use client";

import { useMemo, type MouseEvent } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Food } from "@/lib/types";

const PALETTE = [
  "#8ecae6",
  "#219ebc",
  "#126782",
  "#023047",
  "#ffb703",
  "#fd9e02",
  "#fb8500",
];

const OTHER_COLOR = "var(--muted-foreground)";

interface Segment {
  key: string;
  name: string;
  calories: number;
  pct: number;
  fill: string;
  food?: Food;
}

interface Props {
  foods: Food[];
  onSelect: (f: Food) => void;
}

const chartConfig = {
  calories: { label: "Calories" },
} satisfies ChartConfig;

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Segment }[];
}) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
  return (
    <div className="grid min-w-44 gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{s.name}</div>
      <div className="text-muted-foreground">
        {s.calories.toLocaleString(undefined, { maximumFractionDigits: 0 })} kcal
      </div>
      <div className="text-muted-foreground">{s.pct.toFixed(1)}% of total</div>
      {s.food && <div className="text-muted-foreground/70">Click for details →</div>}
    </div>
  );
}

export function CalorieShareDonut({ foods, onSelect }: Props) {
  const { segments, grandTotal, topCount } = useMemo(() => {
    const sorted = [...foods].sort((a, b) => b.totalCalories - a.totalCalories);
    const total = sorted.reduce((s, f) => s + f.totalCalories, 0);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    const restCal = rest.reduce((s, f) => s + f.totalCalories, 0);

    const segs: Segment[] = top.map((f, i) => ({
      key: f.name,
      name: f.name,
      calories: f.totalCalories,
      pct: total > 0 ? (f.totalCalories / total) * 100 : 0,
      fill: PALETTE[i % PALETTE.length],
      food: f,
    }));

    if (rest.length > 0 && total > 0) {
      segs.push({
        key: "__other__",
        name: `Other (${rest.length})`,
        calories: restCal,
        pct: (restCal / total) * 100,
        fill: OTHER_COLOR,
      });
    }

    return { segments: segs, grandTotal: total, topCount: top.length };
  }, [foods]);

  if (grandTotal <= 0 || segments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Top foods by calories</h2>
          <span className="text-xs text-muted-foreground">
            {topCount} of {foods.length} foods · {Math.round(grandTotal).toLocaleString()} kcal total
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          {/* Donut chart */}
          <ChartContainer
            config={chartConfig}
            className="shrink-0"
            style={{ height: 220, width: 220 }}
          >
            <PieChart>
              <ChartTooltip content={<DonutTooltip />} />
              <Pie
                data={segments}
                dataKey="calories"
                nameKey="name"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={2}
                stroke="none"
                onClick={(data: unknown) => {
                  const seg = (data as unknown as { payload?: Segment }).payload;
                  if (seg?.food) onSelect(seg.food);
                }}
                cursor="pointer"
              >
                {segments.map((s) => (
                  <Cell key={s.key} fill={s.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} dy="-0.5em" className="fill-foreground text-2xl font-semibold">
                            {Math.round(grandTotal).toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} dy="1.4em" className="fill-muted-foreground text-xs">
                            total kcal
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <TooltipProvider delay={200}>
            <div className="grid w-full grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {segments.map((s) => (
                <Tooltip key={s.key}>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          if (s.food) onSelect(s.food);
                        }}
                        className={`flex items-center gap-1.5 ${s.food ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: s.fill }}
                        />
                        <span className="max-w-[140px] truncate text-xs text-muted-foreground">
                          {s.name}
                        </span>
                        <span className="ml-auto text-xs font-medium tabular-nums">
                          {s.pct.toFixed(1)}%
                        </span>
                      </button>
                    }
                  />
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-background/80">
                        {s.calories.toLocaleString(undefined, { maximumFractionDigits: 0 })} kcal · {s.pct.toFixed(1)}%
                        {s.food ? " · click for details" : ""}
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
