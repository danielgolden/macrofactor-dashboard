"use client";

import { GaugeIcon, TrendingDownIcon, TrendingUpIcon, TrophyIcon } from "lucide-react";

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardsProps {
  stats: {
    count: number;
    avgDensity: number;
  };
  trend: number | null;
}

export function SectionCards({ stats, trend }: SectionCardsProps) {
  const trendUp = trend !== null && trend > 0;
  const trendDown = trend !== null && trend < 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card>
        <CardHeader>
          <CardDescription>Total Alimentos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.count}
          </CardTitle>
          <CardAction>
            <TrophyIcon className="size-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          en el período seleccionado
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Densidad Promedio</CardDescription>
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
            <span className="text-muted-foreground">calorías por gramo</span>
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
              {trend.toFixed(1)}% vs período anterior
            </span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
