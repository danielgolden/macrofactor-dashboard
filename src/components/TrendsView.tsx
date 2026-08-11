"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { TrendsSkeleton } from "@/components/LoadingSkeletons";
import type {
  WeekBucket,
  FoodByWeek,
  FoodWeekEntry,
} from "@/lib/aggregateByWeek";

interface WeeklyData {
  weeks: WeekBucket[];
  foodWeeks: FoodByWeek[];
}

const MACRO_COLORS = {
  protein: "#3a7c3a",
  fat: "#2a5a8a",
  carbs: "#a83c2a",
};

const densityConfig = {
  avgDensity: { label: "kcal / g", color: "var(--chart-1)" },
} satisfies ChartConfig;

const macroConfig = {
  proteinPct: { label: "Protein %", color: MACRO_COLORS.protein },
  fatPct: { label: "Fat %", color: MACRO_COLORS.fat },
  carbPct: { label: "Carbs %", color: MACRO_COLORS.carbs },
} satisfies ChartConfig;

const dominantBarConfig = {
  proteinCal: { label: "Protein", color: MACRO_COLORS.protein },
  fatCal: { label: "Fat", color: MACRO_COLORS.fat },
  carbCal: { label: "Carbs", color: MACRO_COLORS.carbs },
} satisfies ChartConfig;

const macroDeltaConfig = {
  proteinDelta: { label: "Protein", color: MACRO_COLORS.protein },
  fatDelta: { label: "Fat", color: MACRO_COLORS.fat },
  carbDelta: { label: "Carbs", color: MACRO_COLORS.carbs },
} satisfies ChartConfig;

function DeltaBadge({ delta, suffix }: { delta: number; suffix: string }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <MinusIcon className="h-3 w-3" /> 0{suffix}
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
    >
      {up ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
      {up ? "+" : ""}
      {delta.toFixed(1)}
      {suffix}
    </span>
  );
}

function DeltaCard({
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  prev,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  delta: number;
  deltaSuffix: string;
  prev: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: color }} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
          <DeltaBadge delta={delta} suffix={deltaSuffix} />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">prev: {prev}{unit}</div>
      </CardContent>
    </Card>
  );
}

function findFoodMovers(
  cur: FoodWeekEntry[] | undefined,
  prev: FoodWeekEntry[] | undefined
): { gainers: { name: string; delta: number }[]; losers: { name: string; delta: number }[] } {
  const curMap = new Map(cur?.map((f) => [f.name, f.calories] as const) ?? []);
  const prevMap = new Map(prev?.map((f) => [f.name, f.calories] as const) ?? []);
  const deltas: { name: string; delta: number }[] = [];

  for (const [name, c] of curMap) {
    const p = prevMap.get(name) ?? 0;
    deltas.push({ name, delta: c - p });
  }
  for (const [name, p] of prevMap) {
    if (!curMap.has(name)) deltas.push({ name, delta: -p });
  }

  deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const gainers = deltas.filter((d) => d.delta > 0).slice(0, 5);
  const losers = deltas.filter((d) => d.delta < 0).slice(0, 5);
  return { gainers, losers };
}

function FoodMoverRow({ name, delta }: { name: string; delta: number }) {
  const up = delta > 0;
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="truncate text-xs">{name}</span>
      <span
        className={`inline-flex shrink-0 items-center gap-0.5 text-xs tabular-nums ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
      >
        {up ? "+" : ""}
        {delta.toFixed(0)} kcal
      </span>
    </div>
  );
}

function findNewAndDropped(
  cur: FoodWeekEntry[] | undefined,
  prev: FoodWeekEntry[] | undefined
): { newFoods: string[]; dropped: string[] } {
  const curNames = new Set(cur?.map((f) => f.name) ?? []);
  const prevNames = new Set(prev?.map((f) => f.name) ?? []);
  return {
    newFoods: Array.from(curNames).filter((n) => !prevNames.has(n)).slice(0, 12),
    dropped: Array.from(prevNames).filter((n) => !curNames.has(n)).slice(0, 12),
  };
}

export function TrendsView() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/weekly", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: WeeklyData & { error?: string }) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const weeks = useMemo(() => data?.weeks ?? [], [data]);
  const nonZeroWeeks = useMemo(() => weeks.filter((w) => w.totalCal > 0), [weeks]);

  const latest = nonZeroWeeks.length > 0 ? nonZeroWeeks[nonZeroWeeks.length - 1] : null;
  const prev = nonZeroWeeks.length > 1 ? nonZeroWeeks[nonZeroWeeks.length - 2] : null;

  const latestFoodWeek = data?.foodWeeks?.find(
    (fw) => latest && fw.weekStart === latest.weekStart
  );
  const prevFoodWeek = data?.foodWeeks?.find(
    (fw) => prev && fw.weekStart === prev.weekStart
  );

  const movers = useMemo(
    () => findFoodMovers(latestFoodWeek?.foods, prevFoodWeek?.foods),
    [latestFoodWeek, prevFoodWeek]
  );

  const newAndDropped = useMemo(
    () => findNewAndDropped(latestFoodWeek?.foods, prevFoodWeek?.foods),
    [latestFoodWeek, prevFoodWeek]
  );

  const dominantChartData = useMemo(() => {
    return nonZeroWeeks.slice(-8).map((w) => ({
      weekLabel: w.weekLabel,
      proteinCal: Math.round(w.proteinG * 4),
      fatCal: Math.round(w.fatG * 9),
      carbCal: Math.round(w.carbsG * 4),
    }));
  }, [nonZeroWeeks]);

  const macroDeltaData = useMemo(() => {
    const recent = nonZeroWeeks.slice(-8);
    return recent.map((w, i) => {
      const prevW = i > 0 ? recent[i - 1] : null;
      return {
        weekLabel: w.weekLabel,
        proteinDelta: prevW ? Math.round(w.proteinG * 4 - prevW.proteinG * 4) : 0,
        fatDelta: prevW ? Math.round(w.fatG * 9 - prevW.fatG * 9) : 0,
        carbDelta: prevW ? Math.round(w.carbsG * 4 - prevW.carbsG * 4) : 0,
      };
    });
  }, [nonZeroWeeks]);

  if (loading) {
    return <TrendsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <p className="text-lg font-semibold text-destructive">Error loading trends</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!latest) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="text-2xl font-semibold">No weekly data</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Import your MacroFactor Excel (.xlsx) or CSV file to see week-over-week trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const densityDelta = prev && prev.avgDensity > 0 ? latest.avgDensity - prev.avgDensity : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Section: average caloric density over time */}
      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-lg font-semibold">Average caloric density</h2>
          <p className="text-sm text-muted-foreground">
            Weekly mean kcal/g of everything you ate — drift toward higher values signals more energy-dense foods.
          </p>
        </div>
        <Card>
          <CardContent className="pt-4">
            <ChartContainer config={densityConfig} className="w-full" style={{ height: 260 }}>
              <AreaChart data={weeks} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="fill-avgDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-avgDensity)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-avgDensity)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="number"
                  domain={[0, "auto"]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  y={latest.avgDensity}
                  stroke="var(--chart-1)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="avgDensity"
                  stroke="var(--color-avgDensity)"
                  strokeWidth={2}
                  fill="url(#fill-avgDensity)"
                  dot={{ r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Section: week-over-week delta cards */}
      {prev && (
        <section className="flex flex-col gap-2">
          <div>
            <h2 className="text-lg font-semibold">
              This week vs last week
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({latest.weekLabel} vs {prev.weekLabel})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <DeltaCard
              label="Protein"
              value={latest.proteinPct.toFixed(1)}
              unit="% cal"
              delta={latest.proteinPct - prev.proteinPct}
              deltaSuffix="pt"
              prev={prev.proteinPct.toFixed(1)}
              color={MACRO_COLORS.protein}
            />
            <DeltaCard
              label="Fat"
              value={latest.fatPct.toFixed(1)}
              unit="% cal"
              delta={latest.fatPct - prev.fatPct}
              deltaSuffix="pt"
              prev={prev.fatPct.toFixed(1)}
              color={MACRO_COLORS.fat}
            />
            <DeltaCard
              label="Carbs"
              value={latest.carbPct.toFixed(1)}
              unit="% cal"
              delta={latest.carbPct - prev.carbPct}
              deltaSuffix="pt"
              prev={prev.carbPct.toFixed(1)}
              color={MACRO_COLORS.carbs}
            />
            <DeltaCard
              label="Avg density"
              value={latest.avgDensity.toFixed(2)}
              unit="kcal/g"
              delta={densityDelta}
              deltaSuffix=""
              prev={prev.avgDensity.toFixed(2)}
              color="var(--chart-1)"
            />
          </div>
        </section>
      )}

      {/* Section: macro % over time */}
      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-lg font-semibold">Macro split over time</h2>
          <p className="text-sm text-muted-foreground">
            Share of weekly calories from each macro.
          </p>
        </div>
        <Card>
          <CardContent className="pt-4">
            <ChartContainer config={macroConfig} className="w-full" style={{ height: 280 }}>
              <LineChart data={weeks} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="number"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="proteinPct" stroke="var(--color-proteinPct)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="fatPct" stroke="var(--color-fatPct)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="carbPct" stroke="var(--color-carbPct)" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Section: dominant macro */}
      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-lg font-semibold">Dominant macro by week</h2>
          <p className="text-sm text-muted-foreground">
            Which macro supplied the most calories each recent week.
          </p>
        </div>
        <Card>
          <CardContent className="pt-4">
            <ChartContainer config={dominantBarConfig} className="w-full" style={{ height: 280 }}>
              <BarChart data={dominantChartData} layout="vertical" margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="weekLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="proteinCal" stackId="a" fill="var(--color-proteinCal)" />
                <Bar dataKey="fatCal" stackId="a" fill="var(--color-fatCal)" />
                <Bar dataKey="carbCal" stackId="a" fill="var(--color-carbCal)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Section: macro delta + biggest movers + new/dropped */}
      {prev && (
        <section className="flex flex-col gap-2">
          <div>
            <h2 className="text-lg font-semibold">What changed this week</h2>
            <p className="text-sm text-muted-foreground">
              Calorie changes by macro vs previous weeks, and food-level shifts vs {prev.weekLabel}.
            </p>
          </div>
          <Card>
            <CardContent className="pt-4">
              <h3 className="mb-2 text-sm font-semibold">Macro calorie deltas by week</h3>
              <ChartContainer config={macroDeltaConfig} className="w-full" style={{ height: 240 }}>
                <BarChart data={macroDeltaData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={50}
                    tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}`}
                  />
                  <ReferenceLine y={0} stroke="var(--border)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="proteinDelta" fill="var(--color-proteinDelta)" />
                  <Bar dataKey="fatDelta" fill="var(--color-fatDelta)" />
                  <Bar dataKey="carbDelta" fill="var(--color-carbDelta)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  ↑ Biggest increases
                </h3>
                {movers.gainers.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">No increases this week.</p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {movers.gainers.map((m) => (
                      <FoodMoverRow key={m.name} name={m.name} delta={m.delta} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                  ↓ Biggest decreases
                </h3>
                {movers.losers.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">No decreases this week.</p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {movers.losers.map((m) => (
                      <FoodMoverRow key={m.name} name={m.name} delta={m.delta} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-semibold">✦ New this week</h3>
                {newAndDropped.newFoods.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">Nothing new.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {newAndDropped.newFoods.map((n) => (
                      <span key={n} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-semibold">✦ Dropped this week</h3>
                {newAndDropped.dropped.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">Nothing dropped.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {newAndDropped.dropped.map((n) => (
                      <span key={n} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
