"use client";
import dynamic from "next/dynamic";
import { prefetchDateRangeBounds } from "@/lib/useDateRangeBounds";
import { prefetchFoods } from "@/lib/useFoods";
import { PRESETS } from "@/lib/dateRange";

// Kick off the /api/date-range request as soon as this page chunk loads, in
// parallel with the dynamic import of Explorer below. The Explorer component
// consumes the in-flight promise via useDateRangeBounds(), so the date-range
// fetch no longer serializes behind the Explorer chunk download.
prefetchDateRangeBounds();

// Speculatively kick off the /api/foods fetch for the most likely initial
// range (last 7 days) alongside the Explorer chunk download and the
// /api/date-range fetch. computeInitialRange returns "last 7 days" whenever
// the user's bounds overlap with it (the common case for active users), so
// useFoods consumes this cached promise instead of issuing its own request —
// removing the /api/foods round-trip from the dashboard's critical fill
// path. The cache is one-shot and self-evicts, so a mismatched range or a
// post-import reload simply fetches fresh.
prefetchFoods(PRESETS.find((p) => p.label === "7 d")!.range());

const Explorer = dynamic(
  () => import("@/components/Explorer").then((m) => m.Explorer),
  { ssr: false },
);

export default function Home() {
  return <Explorer />;
}
