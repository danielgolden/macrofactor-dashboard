"use client";

import { ArrowDownIcon, ArrowUpIcon, FlameIcon, GaugeIcon, TrophyIcon } from "lucide-react";

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Food } from "@/lib/types";

interface SectionCardsProps {
  stats: {
    count: number;
    totalCal: number;
    avgDensity: number;
  };
  sortedByDensity: Food[];
}

export function SectionCards({ stats, sortedByDensity }: SectionCardsProps) {
  const mostDense = sortedByDensity[0];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 xl:grid-cols-4 lg:px-6">
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
        <CardFooter className="text-xs text-muted-foreground">
          calorías por gramo
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Más Denso</CardDescription>
          <CardTitle className="truncate text-2xl font-semibold">
            {mostDense?.name ?? "—"}
          </CardTitle>
          <CardAction>
            <ArrowUpIcon className="size-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          <FlameIcon className="mr-1 size-3 text-muted-foreground" />
          {mostDense?.calDensity.toFixed(1)} kcal/g
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Calorías del Mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.totalCal.toLocaleString()}
          </CardTitle>
          <CardAction>
            <ArrowDownIcon className="size-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          kcal totales consumidas
        </CardFooter>
      </Card>
    </div>
  );
}
