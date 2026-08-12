"use client";
import dynamic from "next/dynamic";
import { prefetchDateRangeBounds } from "@/lib/useDateRangeBounds";

// Kick off the /api/date-range request as soon as this page chunk loads, in
// parallel with the dynamic import of Explorer below. The Explorer component
// consumes the in-flight promise via useDateRangeBounds(), so the date-range
// fetch no longer serializes behind the Explorer chunk download.
prefetchDateRangeBounds();

const Explorer = dynamic(
  () => import("@/components/Explorer").then((m) => ({ default: m.Explorer })),
  { ssr: false },
);

export default function Home() {
  return <Explorer />;
}
