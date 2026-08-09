"use client";

import { GaugeIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardsProps {
  stats: {
    avgDensity: number;
  };
  trend: number | null;
}

export function SectionCards({ stats, trend }: SectionCardsProps) {
  const trendUp = trend !== null && trend > 0;
  const trendDown = trend !== null && trend < 0;

  return (
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
        {trend === null ? (
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
  );
}
