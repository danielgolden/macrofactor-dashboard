"use client";
import { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import type { DateBounds } from "./dateRange";

export function useDateRangeBounds() {
  const [bounds, setBounds] = useState<DateBounds | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/date-range")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d.min && d.max) {
          setBounds({ min: parseISO(d.min), max: parseISO(d.max) });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { bounds, loading };
}
