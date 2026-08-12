"use client";

import { useMemo, type MouseEvent } from "react";

import { Card, CardContent } from "@/components/ui/card";
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
  startAngle: number;
  endAngle: number;
}

interface Props {
  foods: Food[];
  onSelect: (f: Food) => void;
}

// Donut geometry. These mirror the previous recharts <Pie> sizing
// (innerRadius=62, outerRadius=88) so the layout and the matching skeleton
// (LoadingSkeletons.tsx -> size-[220px]) remain pixel-identical.
const SIZE = 220;
const CENTER = SIZE / 2;
const MID_RADIUS = (62 + 88) / 2; // 75
const STROKE_WIDTH = 88 - 62; // 26
const GAP_DEG = 2; // recharts paddingAngle equivalent

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  // angleDeg measured clockwise from 12 o'clock
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function CalorieShareDonut({ foods, onSelect }: Props) {
  const { segments, grandTotal, topCount } = useMemo(() => {
    const sorted = [...foods].sort((a, b) => b.totalCalories - a.totalCalories);
    const total = sorted.reduce((s, f) => s + f.totalCalories, 0);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    const restCal = rest.reduce((s, f) => s + f.totalCalories, 0);

    const raw: { key: string; name: string; calories: number; pct: number; fill: string; food?: Food }[] = top.map((f, i) => ({
      key: f.name,
      name: f.name,
      calories: f.totalCalories,
      pct: total > 0 ? (f.totalCalories / total) * 100 : 0,
      fill: PALETTE[i % PALETTE.length],
      food: f,
    }));

    if (rest.length > 0 && total > 0) {
      raw.push({
        key: "__other__",
        name: `Other (${rest.length})`,
        calories: restCal,
        pct: (restCal / total) * 100,
        fill: OTHER_COLOR,
      });
    }

    // Lay segments end-to-end clockwise from 12 o'clock, reserving GAP_DEG
    // of empty space after each one so neighbouring slices don't touch —
    // matching the prior recharts paddingAngle={2} look.
    let cursor = 0;
    const segs: Segment[] = raw.map((s) => {
      const deg = (s.pct / 100) * 360;
      const arcDeg = Math.max(deg - GAP_DEG, 0);
      const seg: Segment = {
        ...s,
        startAngle: cursor,
        endAngle: cursor + arcDeg,
      };
      cursor += deg;
      return seg;
    });

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
          {/* Donut chart. The center figure is an HTML overlay (sibling of
           * the SVG) rather than an SVG <text>, because earlier attempts at
           * centering in SVG via dominant-baseline + em-relative dy drifted
           * whenever type sizes or digit counts changed.
           * `flex flex-col items-center justify-center` under a
           * `relative shrink-0` wrapper keeps the text concentric with the
           * ring at any font size. See issue #48. */}
          <div
            className="relative shrink-0"
            style={{ height: SIZE, width: `min(${SIZE}px, 100%)` }}
          >
            <TooltipProvider delay={200}>
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="h-full w-full"
                role="img"
                aria-label="Top foods by calorie share"
              >
                {segments.map((s) => {
                  const interactive = Boolean(s.food);
                  const d = arcPath(CENTER, CENTER, MID_RADIUS, s.startAngle, s.endAngle);
                  return (
                    <Tooltip key={s.key}>
                      <TooltipTrigger
                        render={
                          <path
                            d={d}
                            fill="none"
                            stroke={s.fill}
                            strokeWidth={STROKE_WIDTH}
                            strokeLinecap="butt"
                            style={{ cursor: interactive ? "pointer" : "default" }}
                            onClick={(e: MouseEvent) => {
                              if (!s.food) return;
                              e.stopPropagation();
                              onSelect(s.food);
                            }}
                          />
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
                  );
                })}
              </svg>
            </TooltipProvider>
            <div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              aria-hidden="true"
            >
              <div className="text-2xl font-semibold tabular-nums">
                {Math.round(grandTotal).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">total kcal</div>
            </div>
          </div>

          {/* Legend. Each row is `items-start` and the swatch is fixed-size
           * so it doesn't reflow when the name truncates. The name is
           * clamped to a single visual line (`truncate` — white-space:
           * nowrap + overflow:hidden + text-overflow:ellipsis) and
           * spans the available column width via `min-w-0` inside a
           * min-content grid cell. The hover <Tooltip> remains so very
           * long MacroFactor names ("Brand · Preparation, raw") can still
           * be read in full on hover. Matches the linked Brian Tree
           * single-line truncation pattern. */}
          <TooltipProvider delay={200}>
            <div className="grid w-full grid-cols-1 items-start gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {segments.map((s) => (
                <Tooltip key={s.key}>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          if (s.food) onSelect(s.food);
                        }}
                        className={`flex w-full items-center gap-1.5 text-left ${s.food ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: s.fill }}
                        />
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                          {s.name}
                        </span>
                        <span className="shrink-0 text-xs font-medium tabular-nums">
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
