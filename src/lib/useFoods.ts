"use client";
import { useState, useEffect, useRef } from "react";
import type { Food } from "@/lib/types";

export function useFoods(
  search: string,
  page: number,
  dateRange: { start: string; end: string } | null = null,
  fetchAll = false
) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
      if (search) params.set("search", search);
    } else if (search) {
      params.set("search", search);
    } else if (fetchAll) {
      params.set("all", "true");
    } else {
      params.set("page", String(page));
    }

    fetch(`/api/foods?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setFoods(d.foods);
        setTotal(d.total);
        setTotalPages(d.totalPages ?? 1);
      })
      .catch((e) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [search, page, dateRange, fetchAll]);

  return { foods, total, totalPages, loading, error, setFoods };
}
