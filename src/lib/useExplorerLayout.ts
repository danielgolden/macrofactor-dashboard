"use client";

import { useCallback, useEffect, useState } from "react";

export type BlockId = "stats" | "donut" | "table";

/**
 * Canonical block order for new users. Adding a new id here in the future
 * is safe: `mergeOrder` appends a missing id at its default position
 * rather than rejecting the whole stored array.
 */
export const DEFAULT_BLOCK_ORDER: BlockId[] = ["stats", "donut", "table"];

export const BLOCK_LABELS: Record<BlockId, string> = {
  stats: "Stats cards",
  donut: "Top foods by calories",
  table: "Food table",
};

function isBlockId(x: unknown): x is BlockId {
  return x === "stats" || x === "donut" || x === "table";
}

/**
 * Merge a stored order with the canonical defaults so:
 *   - known ids keep their stored position (re-orderable prefs survive)
 *   - unknown ids are dropped (forward-compat with renamed/removed blocks)
 *   - missing ids are appended in their default order
 *
 * This is the difference between "users lose their arrangement every
 * time we add a block" (the prior implementation's reject-on-shape-
 * mismatch behavior) and "users keep their arrangement".
 */
export function mergeOrder(stored: unknown): BlockId[] {
  const out: BlockId[] = [];
  if (Array.isArray(stored)) {
    for (const x of stored) {
      if (isBlockId(x) && !out.includes(x)) out.push(x);
    }
  }
  for (const id of DEFAULT_BLOCK_ORDER) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

function storageKey(userId: string | null): string | null {
  if (!userId) return null;
  return `mf.explorerLayout.${userId}`;
}

const EMPTY: BlockId[] = mergeOrder(undefined);

/**
 * Per-user persisted order of Explorer blocks.
 *
 * Storage is localStorage (no schema migration needed today; the hook
 * hides the backend so we can graduate to a Supabase user_preferences
 * table later without changing call-sites).
 *
 * Reads happen in an effect, never in the `useState` initializer —
 * reading localStorage during render makes the server and first client
 * render disagree and explodes in hydration.
 */
export function useExplorerLayout(userId: string | null): {
  order: BlockId[];
  setOrder: (next: BlockId[]) => void;
  reset: () => void;
  hydrated: boolean;
} {
  const [order, setOrderState] = useState<BlockId[]>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once we have a user id.
  useEffect(() => {
    const key = storageKey(userId);
    if (!key) {
      // Anonymous (signed-out) users can't be persisted; fall back to
      // the in-memory default and let hydration mark itself done.
      setOrderState(DEFAULT_BLOCK_ORDER);
      setHydrated(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(key);
      setOrderState(mergeOrder(raw ? JSON.parse(raw) : undefined));
    } catch {
      // Corrupt entry, JSON parse error, quota error — silently reset.
      setOrderState(DEFAULT_BLOCK_ORDER);
    }
    setHydrated(true);
  }, [userId]);

  const setOrder = useCallback(
    (next: BlockId[]) => {
      const merged = mergeOrder(next);
      setOrderState(merged);
      const key = storageKey(userId);
      if (key) {
        try {
          window.localStorage.setItem(key, JSON.stringify(merged));
        } catch {
          // Quota / private mode — silently ignore; the in-memory copy
          // still wins for this session.
        }
      }
    },
    [userId],
  );

  const reset = useCallback(() => {
    setOrder(DEFAULT_BLOCK_ORDER);
  }, [setOrder]);

  return { order, setOrder, reset, hydrated };
}
