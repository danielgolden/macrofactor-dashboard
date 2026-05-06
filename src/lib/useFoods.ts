"use client";
import { useState, useEffect } from "react";
import type { Food } from "@/lib/types";

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/foods")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setFoods(d.foods);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { foods, loading, error, setFoods };
}
