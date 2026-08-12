"use client";
import { useState, useEffect, useRef } from "react";
import type { Food } from "@/lib/types";

// One-shot prefetch cache for the dashboard's initial /api/foods request.
// The /app page chunk kicks off a speculative fetch for the likely initial
// range (last 7 days) in parallel with the Explorer chunk download and the
// /api/date-range fetch, so the /api/foods round-trip no longer serializes
// behind bounds resolution + a React state tick. computeInitialRange
// returns "last 7 days" whenever the user's bounds overlap with it (the
// common case for active users); when the range matches, useFoods consumes
// the cached promise instead of issuing its own request.
//
// Entries are consumed once then deleted, and self-evict on settle, so the
// cache can never serve stale data after a data import or a manual range
// change — a mismatched range simply fetches fresh.
const foodsPrefetchCache = new Map<string, Promise<Food[]>>();

function foodsCacheKey(range: { start: string; end: string }): string {
  return `${range.start}|${range.end}|all=true`;
}

export function prefetchFoods(range: { start: string; end: string }): Promise<Food[]> {
  const key = foodsCacheKey(range);
  const existing = foodsPrefetchCache.get(key);
  if (existing) return existing;

  const params = new URLSearchParams({
    startDate: range.start,
    endDate: range.end,
    all: "true",
  });
  const p = fetch(`/api/foods?${params}`)
    .then((r) => r.json())
    .then((d) => {
      if (d.error) throw new Error(d.error);
      return d.foods as Food[];
    });
  foodsPrefetchCache.set(key, p);
  // Self-evict on settle so an unconsumed or rejected prefetch can never
  // leak or shadow a later fresh fetch for the same range.
  p.finally(() => {
    if (foodsPrefetchCache.get(key) === p) foodsPrefetchCache.delete(key);
  });
  return p;
}

export function useFoods(dateRange: { start: string; end: string } | null = null) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!dateRange) {
      setFoods([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // If the page chunk already started this exact fetch, consume the
    // in-flight promise rather than firing a duplicate request. The cache
    // entry is removed here (one-shot) so a subsequent request for the same
    // range — e.g. after a data import — always hits the network fresh.
    const key = foodsCacheKey(dateRange);
    const cached = foodsPrefetchCache.get(key);
    if (cached) {
      foodsPrefetchCache.delete(key);
      let active = true;
      cached
        .then((f) => {
          if (active && !controller.signal.aborted) setFoods(f);
        })
        .catch((e) => {
          if (active && !controller.signal.aborted && e?.name !== "AbortError") {
            setError(e.message);
          }
        })
        .finally(() => {
          if (active && !controller.signal.aborted) setLoading(false);
        });
      return () => {
        active = false;
        controller.abort();
      };
    }

    const params = new URLSearchParams();
    params.set("startDate", dateRange.start);
    params.set("endDate", dateRange.end);
    params.set("all", "true");

    fetch(`/api/foods?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setFoods(d.foods);
      })
      .catch((e) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [dateRange]);

  return { foods, setFoods, loading, error };
}
