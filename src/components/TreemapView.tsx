"use client";

import { useMemo } from "react";
import { Treemap } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Food, Category } from "@/lib/types";
import { CAT_META } from "@/lib/types";

const chartConfig = {
  protein: { label: "Protein", color: CAT_META.protein.color },
  carb: { label: "Carbs", color: CAT_META.carb.color },
  fat: { label: "Fat", color: CAT_META.fat.color },
  mixed: { label: "Mixed", color: CAT_META.mixed.color },
} satisfies ChartConfig;

/**
 * Returns a readable text color (dark or white) for a given hex fill,
 * based on relative luminance. Used for treemap cell labels that sit
 * on top of category-colored fills.
 */
function readableTextColor(hex: string): string {
  const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "#fff";
  const [, r, g, b] = m;
  const [ri, gi, bi] = [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  // Relative luminance (sRGB) per WCAG
  const lum = (0.2126 * ri + 0.7152 * gi + 0.0722 * bi) / 255;
  return lum > 0.55 ? "#023047" : "#fff";
}

interface TreemapNodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  totalCalories?: number;
  fill?: string;
  pct?: string;
  root?: unknown;
  depth?: number;
  index?: number;
  payload?: Food;
  onSelect?: (f: Food) => void;
}

function TreemapNode(props: TreemapNodeProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload, fill, onSelect, pct } = props;
  if (width <= 0 || height <= 0) return null;

  const showName = width > 72 && height > 28;
  const showCals = width > 72 && height > 48;
  const textColor = readableTextColor(fill ?? "#fff");

  return (
    <g
      onClick={() => payload && onSelect?.(payload)}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.85}
        stroke="var(--background)"
        strokeWidth={2}
      />
      {showName && payload && (
        <text
          x={x + 6}
          y={y + height - (showCals ? 22 : 10)}
          fontSize={Math.min(11, Math.max(8, width / 12))}
          fill={textColor}
          fontWeight={600}
          style={{ pointerEvents: "none", textShadow: textColor === "#fff" ? "0 1px 3px rgba(0,0,0,0.5)" : "none" }}
        >
          {payload.name.length * 6.5 > width - 12
            ? payload.name.slice(0, Math.max(3, Math.floor((width - 12) / 6.5))) + "…"
            : payload.name}
        </text>
      )}
      {showCals && payload && (
        <text
          x={x + 6}
          y={y + height - 8}
          fontSize={Math.min(10, Math.max(7, width / 14))}
          fill={textColor === "#fff" ? "rgba(255,255,255,0.8)" : "rgba(2,48,71,0.7)"}
          style={{ pointerEvents: "none" }}
        >
          {payload.totalCalories.toLocaleString()} kcal{pct ? ` · ${pct}%` : ""}
        </text>
      )}
    </g>
  );
}

function TreemapTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: Food & { pct: string } }[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const f = payload[0].payload;
  return (
    <div className="grid min-w-44 gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{f.name}</div>
      <div className="text-muted-foreground">{f.totalCalories.toLocaleString()} total kcal</div>
      <div className="text-muted-foreground">{f.pct}% of period</div>
      <div className="text-muted-foreground/70">
        {f.calDensity} kcal/g · ×{f.timesEaten} times
      </div>
      <div className="text-muted-foreground/70">
        P {f.proteinPct}% · F {f.fatPct}% · C {f.carbPct}%
      </div>
    </div>
  );
}

export function TreemapView({ foods, onSelect }: { foods: Food[]; onSelect: (f: Food) => void }) {
  const total = useMemo(() => foods.reduce((s, f) => s + f.totalCalories, 0), [foods]);

  const data = useMemo(
    () =>
      foods.map((f) => ({
        ...f,
        fill: CAT_META[f.category].color,
        pct: total > 0 ? ((f.totalCalories / total) * 100).toFixed(1) : "0",
      })),
    [foods, total]
  );

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Calorie map</h2>
        <p className="text-sm text-muted-foreground">
          Area proportional to total calories consumed · Color by category · Click for details
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[520px] w-full">
        <Treemap
          data={data}
          dataKey="totalCalories"
          nameKey="name"
          content={<TreemapNode onSelect={onSelect} />}
          isAnimationActive={false}
        >
          <ChartTooltip content={<TreemapTooltip total={total} />} />
        </Treemap>
      </ChartContainer>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(Object.entries(CAT_META) as [Category, (typeof CAT_META)[Category]][]).map(([, meta]) => (
          <span key={meta.label} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-[2px]" style={{ background: meta.color }} />
            {meta.label}
          </span>
        ))}
      </div>
    </div>
  );
}
