"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export type ExplorerBlockId = "stats" | "donut" | "controls" | "table";

export const DEFAULT_LAYOUT: ExplorerBlockId[] = [
  "stats",
  "donut",
  "controls",
  "table",
];

export const BLOCK_LABELS: Record<ExplorerBlockId, string> = {
  stats: "Stats cards",
  donut: "Calorie share donut",
  controls: "Search & filters",
  table: "Food table",
};

const STORAGE_PREFIX = "mf.explorerLayout.";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/**
 * Read the persisted layout from localStorage.
 * Falls back to DEFAULT_LAYOUT on first visit, empty storage, parse error,
 * or a shape that doesn't contain exactly the expected block ids.
 */
function readLayout(
  userId: string | null | undefined
): ExplorerBlockId[] {
  if (!userId || typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULT_LAYOUT;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_LAYOUT;
    // Validate: exactly the default ids, no dupes, no unknown ids.
    const valid =
      parsed.length === DEFAULT_LAYOUT.length &&
      DEFAULT_LAYOUT.every((id) => parsed.includes(id)) &&
      parsed.every(
        (id) => DEFAULT_LAYOUT.includes(id as ExplorerBlockId)
      );
    if (!valid) return DEFAULT_LAYOUT;
    return parsed as ExplorerBlockId[];
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function writeLayout(userId: string, layout: ExplorerBlockId[]): void {
  try {
    window.localStorage.setItem(
      storageKey(userId),
      JSON.stringify(layout)
    );
  } catch {
    // Swallow — localStorage may be unavailable (private mode, quota).
  }
}

/**
 * Manages the Explorer dashboard block order in localStorage, keyed
 * per-user. The storage backend is isolated here so it can later graduate
 * to a Supabase user-settings table without touching call sites.
 */
export function useExplorerLayout() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const [layout, setLayoutState] =
    useState<ExplorerBlockId[]>(DEFAULT_LAYOUT);

  // Read from localStorage once we have a user id (and on mount).
  useEffect(() => {
    setLayoutState(readLayout(userId));
  }, [userId]);

  const setLayout = useCallback(
    (
      next:
        | ExplorerBlockId[]
        | ((prev: ExplorerBlockId[]) => ExplorerBlockId[])
    ) => {
      setLayoutState((prev) => {
        const resolved =
          typeof next === "function" ? next(prev) : next;
        if (userId) writeLayout(userId, resolved);
        return resolved;
      });
    },
    [userId]
  );

  return { layout, setLayout };
}
