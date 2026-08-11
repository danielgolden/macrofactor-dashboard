"use client";

import { useMemo } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Food } from "@/lib/types";

interface Props {
  foods: Food[];
}

const chartConfig = {
  value: { label: "%", color: "var(--chart-1)" },
} satisfies ChartConfig;

/**
 * Aggregates the user's macro profile across the supplied foods (which are
 * already scoped to the selected date range by the parent) and renders it as
 * a radar chart — the same shape used inside the per-food DetailModal.
 *
 * The three macros (protein / carbs / fat) are weighted by each food's
 * total calories so that a food eaten in volume contributes proportionally
 * more to the profile than one nibbled once.
 */
export function MacroProfileRadar({ foods }: Props) {
  const { radarData, hasData } = useMemo(() => {
    let pCal = 0, fCal = 0, cCal = 0;
    let totalCal = 0;

    for (const f of foods) {
      const cal = f.totalCalories;
      if (cal <= 0) continue;
      // Macro percentages on each food are already calories-from-macro / total
      // calories × 100, so weighting by the food's total calories gives the
      // calorie-share contribution for each macro across the whole range.
      pCal += f.proteinPct * cal;
      fCal += f.fatPct * cal;
      cCal += f.carbPct * cal;
      totalCal += cal;
    }

    if (totalCal <= 0) {
      return { radarData: [], hasData: false };
    }

    const protein = Math.round(pCal / totalCal);
    const fat = Math.round(fCal / totalCal);
    const carbs = Math.round(cCal / totalCal);

    return {
      radarData: [
        { axis: "Protein", value: protein },
        { axis: "Carbs", value: carbs },
        { axis: "Fat", value: fat },
      ],
      hasData: true,
    };
  }, [foods]);

  if (!hasData) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Your macro profile</h2>
          <span className="text-xs text-muted-foreground">
            {foods.length} foods · {Math.round(
              foods.reduce((s, f) => s + f.totalCalories, 0)
            ).toLocaleString()} kcal
          </span>
        </div>

        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[220px] w-full max-w-[300px]"
        >
          <RadarChart data={radarData} outerRadius="72%">
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar
              dataKey="value"
              fill="var(--chart-1)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 4, fillOpacity: 1, fill: "var(--chart-1)", stroke: "var(--chart-1)" }}
            />
          </RadarChart>
        </ChartContainer>

        <div className="mt-1 flex justify-center gap-4 text-xs text-muted-foreground">
          {radarData.map((d) => (
            <span key={d.axis}>{d.axis[0]} {d.value}%</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
