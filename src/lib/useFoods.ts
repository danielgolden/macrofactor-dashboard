"use client";
import { useState, useEffect, useRef } from "react";
import type { Food } from "@/lib/types";

export function useFoods(dateRange: { start: string; end: string } | null = null) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams();

    if (dateRange) {
      params.set("startDate", dateRange.start);
      params.set("endDate", dateRange.end);
    }
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
