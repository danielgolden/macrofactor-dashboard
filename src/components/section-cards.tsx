"use client";

import {
  GaugeIcon,
  LoaderCircleIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react";

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardsProps {
  stats: {
    count: number;
    avgDensity: number;
    highDensityPct?: number;
    highDensityCalories?: number;
    totalCalories?: number;
  };
  trend: number | null;
  /** Optional share-trend vs previous period (#56). */
  highDensityTrend?: number | null;
  /** True while the background previous-period avg-density fetch is in flight. */
  prevAvgDensityLoading?: boolean;
}

export function SectionCards({ stats, trend, prevAvgDensityLoading = false }: SectionCardsProps) {
  const trendUp = trend !== null && trend > 0;
  const trendDown = trend !== null && trend < 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-6">
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
    </div>
  );
}
