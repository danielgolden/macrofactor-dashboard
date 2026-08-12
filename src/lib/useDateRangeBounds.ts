"use client";
import { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import type { DateBounds } from "./dateRange";

type BoundsPayload = { min: string; max: string } | null;

// One-shot prefetch cache for the in-flight /api/date-range request. Kicking
// this off as early as possible (e.g. from the /app page chunk, before the
// Explorer chunk finishes downloading) parallelizes the date-range fetch with
// the Explorer code download, removing the Explorer chunk latency from the
// dashboard's critical fill path.
//
// The entry is consumed once then cleared, and self-evicts on settle, so a
// remount (e.g. soft-navigating away and back after a data import) always
// fetches fresh bounds instead of replaying a stale result.
let boundsPromise: Promise<BoundsPayload> | null = null;

function fetchBounds(): Promise<BoundsPayload> {
  return fetch("/api/date-range")
    .then((r) => r.json())
    .then((d) => (d && d.min && d.max ? { min: d.min, max: d.max } : null))
    .catch(() => null);
}

export function prefetchDateRangeBounds(): Promise<BoundsPayload> {
  if (!boundsPromise) {
    const p = fetchBounds();
    boundsPromise = p;
    const evict = () => {
      if (boundsPromise === p) boundsPromise = null;
    };
    p.then(evict, evict);
  }
  return boundsPromise;
}

export function useDateRangeBounds() {
  const [bounds, setBounds] = useState<DateBounds | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const p = boundsPromise ?? fetchBounds();
    boundsPromise = null;
    p.then((d) => {
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
