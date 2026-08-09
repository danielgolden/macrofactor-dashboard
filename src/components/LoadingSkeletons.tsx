"use client";

import { LoaderCircleIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Small spinner + status text. Rendered at the top of each skeleton block so
 * users see both motion (spinner) and context (what is loading).
 */
export function LoadingStatus({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 text-sm text-muted-foreground lg:px-6">
      <LoaderCircleIcon className="size-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}

/**
 * Skeleton mirroring the Explorer dashboard layout: date picker + stat cards
 * (SectionCards) + calorie-share donut (CalorieShareDonut) + controls + foods
 * table (ExplorerView).
 */
export function ExplorerSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <LoadingStatus text="Loading your foods…" />

      {/* Date range picker */}
      <div className="px-4 lg:px-6">
        <Skeleton className="h-9 w-full max-w-sm" />
      </div>

      {/* Stat cards (mirrors SectionCards) */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-3 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Donut (mirrors CalorieShareDonut) */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <Skeleton className="size-[220px] shrink-0 rounded-full" />
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full max-w-[180px]" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls + Table (mirrors Controls + ExplorerView) */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Skeleton className="h-9 w-full" />
        <div className="rounded-lg border">
          <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="ml-auto h-7 w-16" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b px-4 py-2.5 last:border-0"
            >
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-40 max-w-[200px]" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="ml-auto h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton mirroring the Scatter view: controls bar + scatter chart with
 * quadrant labels + quadrant description cards.
 */
export function ScatterSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <LoadingStatus text="Loading your foods…" />

      {/* Date range picker */}
      <div className="px-4 lg:px-6">
        <Skeleton className="h-9 w-full max-w-sm" />
      </div>

      {/* Stat cards (shared across data views) */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-3 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Donut (shared) */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <Skeleton className="size-[220px] shrink-0 rounded-full" />
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full max-w-[180px]" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls + scatter chart */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Skeleton className="h-9 w-full" />

        {/* Scatter chart heading */}
        <div>
          <Skeleton className="h-5 w-64" />
          <Skeleton className="mt-1 h-4 w-full max-w-lg" />
        </div>

        {/* Scatter chart */}
        <Card>
          <CardContent className="pt-4">
            <Skeleton className="h-[420px] w-full rounded-md" />
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>

        {/* Quadrant description cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton mirroring the Ranking view: controls bar + heading + horizontal
 * bar chart with food name labels on the y-axis.
 */
export function RankingSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <LoadingStatus text="Loading your foods…" />

      {/* Date range picker */}
      <div className="px-4 lg:px-6">
        <Skeleton className="h-9 w-full max-w-sm" />
      </div>

      {/* Stat cards (shared) */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-3 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Donut (shared) */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <Skeleton className="size-[220px] shrink-0 rounded-full" />
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full max-w-[180px]" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls + ranking chart */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Skeleton className="h-9 w-full" />

        {/* Ranking heading */}
        <div>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="mt-1 h-4 w-full max-w-md" />
        </div>

        {/* Horizontal bar chart (mirrors RankingView) */}
        <div className="rounded-lg border p-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-5 flex-1" style={{ maxWidth: `${90 - i * 5}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton mirroring the Treemap view: controls bar + heading + large treemap
 * grid + category legend.
 */
export function TreemapSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <LoadingStatus text="Loading your foods…" />

      {/* Date range picker */}
      <div className="px-4 lg:px-6">
        <Skeleton className="h-9 w-full max-w-sm" />
      </div>

      {/* Stat cards (shared) */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-3 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Donut (shared) */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <Skeleton className="size-[220px] shrink-0 rounded-full" />
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full max-w-[180px]" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls + treemap */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Skeleton className="h-9 w-full" />

        {/* Treemap heading */}
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-1 h-4 w-full max-w-lg" />
        </div>

        {/* Treemap grid (mirrors TreemapView h-[520px]) */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid h-[520px] grid-cols-4 grid-rows-4 gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="rounded-[2px]"
                  style={{
                    gridColumn: i < 4 ? "span 2" : "span 1",
                    gridRow: i < 2 ? "span 2" : "span 1",
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="size-2.5 rounded-[2px]" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton mirroring the Trends view layout: average-density area chart +
 * week-over-week delta cards + macro-split line chart + dominant-macro chips +
 * biggest movers grid.
 */
export function TrendsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingStatus text="Loading weekly trends…" />

      {/* Average density area chart */}
      <section className="flex flex-col gap-2">
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-1 h-4 w-full max-w-lg" />
        </div>
        <Card>
          <CardContent className="pt-4">
            <Skeleton className="h-[260px] w-full rounded-md" />
          </CardContent>
        </Card>
      </section>

      {/* Week-over-week delta cards */}
      <section className="flex flex-col gap-2">
        <Skeleton className="h-5 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="px-4 py-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-7 w-24" />
                <Skeleton className="mt-1 h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Macro split line chart */}
      <section className="flex flex-col gap-2">
        <div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-1 h-4 w-full max-w-sm" />
        </div>
        <Card>
          <CardContent className="pt-4">
            <Skeleton className="h-[280px] w-full rounded-md" />
          </CardContent>
        </Card>
      </section>

      {/* Dominant macro chips */}
      <section className="flex flex-col gap-2">
        <div>
          <Skeleton className="h-5 w-52" />
          <Skeleton className="mt-1 h-4 w-full max-w-md" />
        </div>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Biggest movers */}
      <section className="flex flex-col gap-2">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-32" />
                <div className="mt-3 space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
