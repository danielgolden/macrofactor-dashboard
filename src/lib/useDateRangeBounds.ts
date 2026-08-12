"use client";
import { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import type { DateBounds } from "./dateRange";

type BoundsPayload = { min: string; max: string } | null;

// Module-level cache for the in-flight /api/date-range request. Kicking this
// off as early as possible (e.g. from the /app page chunk, before the Explorer
// chunk finishes downloading) parallelizes the date-range fetch with the
// Explorer code download, removing the Explorer chunk latency from the
// dashboard's critical fill path.
let boundsPromise: Promise<BoundsPayload> | null = null;

export function prefetchDateRangeBounds(): Promise<BoundsPayload> {
  if (!boundsPromise) {
    boundsPromise = fetch("/api/date-range")
      .then((r) => r.json())
      .then((d) => (d && d.min && d.max ? { min: d.min, max: d.max } : null))
      .catch(() => null);
  }
  return boundsPromise;
}

export function useDateRangeBounds() {
  const [bounds, setBounds] = useState<DateBounds | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    prefetchDateRangeBounds().then((d) => {
      if (!active) return;
      if (d) {
        setBounds({ min: parseISO(d.min), max: parseISO(d.max) });
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { bounds, loading };
}
