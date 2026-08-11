"use client";

import {
  FlameIcon,
  GaugeIcon,
  LoaderCircleIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react";

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ZONE_META } from "@/lib/types";

interface SectionCardsProps {
  stats: {
    count: number;
    avgDensity: number;
    highDensityPct: number;
    highDensityCalories: number;
    totalCalories: number;
  };
  trend: number | null;
  highDensityTrend: number | null;
  /** True while the background previous-period avg-density fetch is in flight. */
  prevAvgDensityLoading?: boolean;
}

export function SectionCards({
  stats,
  trend,
  highDensityTrend,
  prevAvgDensityLoading = false,
}: SectionCardsProps) {
  const trendUp = trend !== null && trend > 0;
  const trendDown = trend !== null && trend < 0;
  const highUp = highDensityTrend !== null && highDensityTrend > 0;
  const highDown = highDensityTrend !== null && highDensityTrend < 0;

  // The grid switches from `lg:grid-cols-2` to `sm:grid-cols-2 lg:grid-cols-3`
  // now that we have three cards. See issue #56.
  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-6">
      <Card>
        <CardHeader>
          <CardDescription>Total Foods</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.count}
          </CardTitle>
          <CardAction>
            <TrophyIcon className="size-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          in the selected period
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Average Density</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.avgDensity.toFixed(2)}{" "}
            <span className="text-sm font-normal text-muted-foreground">kcal/g</span>
          </CardTitle>
          <CardAction>
            <GaugeIcon className="size-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="text-xs">
          {prevAvgDensityLoading ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <LoaderCircleIcon className="size-3 animate-spin" />
              comparing to previous period…
            </span>
          ) : trend === null ? (
            <span className="text-muted-foreground">calories per gram</span>
          ) : (
            <span
              className={
                trendUp
                  ? "flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"
                  : trendDown
                    ? "flex items-center gap-1 font-medium text-red-600 dark:text-red-400"
                    : "flex items-center gap-1 text-muted-foreground"
              }
            >
              {trendUp ? (
                <TrendingUpIcon className="size-3" />
              ) : trendDown ? (
                <TrendingDownIcon className="size-3" />
              ) : null}
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}% vs previous period
            </span>
          )}
        </CardFooter>
      </Card>

      {/* New card in #56: share of *calories* (not food count) coming from
       * high-density foods (>4 kcal/g). Reads from `displayFoods` so it
       * is unaffected by the active search/zone/category filter, matching
       * the other two cards. Footer format:
       *   "12,480 of 20,000 kcal · >4 kcal/g · +4.2% vs previous period" */}
      <Card>
        <CardHeader>
          <CardDescription>Calories from high-density foods</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.totalCalories > 0 ? `${stats.highDensityPct.toFixed(1)}%` : "—"}
          </CardTitle>
          <CardAction>
            <FlameIcon className="size-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        {stats.totalCalories > 0 ? (
          <CardFooter className="flex flex-col items-start gap-2">
            {/* Single horizontal meter under the figure; the donut lives
             * directly below so this stays a no-chart card. role="meter"
             * + aria-valuenow for screen readers. */}
            <div
              className="h-1.5 w-full rounded-full bg-muted"
              role="meter"
              aria-label="Share of calories from high-density foods"
              aria-valuenow={Math.round(stats.highDensityPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${Math.min(100, Math.max(0, stats.highDensityPct))}%`, background: ZONE_META.high.fill }}
              />
            </div>
            <div className="flex w-full items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">
                {Math.round(stats.highDensityCalories).toLocaleString()} of{" "}
                {Math.round(stats.totalCalories).toLocaleString()} kcal · {ZONE_META.high.range}
              </span>
              {prevAvgDensityLoading ? (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <LoaderCircleIcon className="size-3 animate-spin" />
                </span>
              ) : highDensityTrend === null ? null : (
                <span
                  className={
                    highUp
                      ? "flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"
                      : highDown
                        ? "flex items-center gap-1 font-medium text-red-600 dark:text-red-400"
                        : "flex items-center gap-1 text-muted-foreground"
                  }
                >
                  {highUp ? (
                    <TrendingUpIcon className="size-3" />
                  ) : highDown ? (
                    <TrendingDownIcon className="size-3" />
                  ) : null}
                  {highDensityTrend > 0 ? "+" : ""}
                  {highDensityTrend.toFixed(1)}%
                </span>
              )}
            </div>
          </CardFooter>
        ) : (
          <CardFooter className="text-xs text-muted-foreground">
            no calories in this period
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
