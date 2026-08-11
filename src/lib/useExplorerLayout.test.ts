import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExplorerLayout, DEFAULT_BLOCK_ORDER, mergeOrder } from "@/lib/useExplorerLayout";

const USER_ID = "user_123";

beforeEach(() => {
  window.localStorage.clear();
});

describe("mergeOrder", () => {
  it("returns default order when given nothing", () => {
    expect(mergeOrder(undefined)).toEqual(DEFAULT_BLOCK_ORDER);
  });

  it("preserves a known stored order", () => {
    expect(mergeOrder(["donut", "stats", "table"])).toEqual(["donut", "stats", "table"]);
  });

  it("preserves known ids but appends missing ones in default order (forward compat)", () => {
    // Simulates a future where a 4th block was added to DEFAULT_BLOCK_ORDER
    // and an existing user has a stored 3-id array: their preference
    // survives *and* the new block lands at its default position rather
    // than wiping the layout entirely.
    expect(mergeOrder(["table", "stats"])).toEqual(
      expect.arrayContaining(["table", "stats"]),
    );
    expect(mergeOrder(["table", "stats"])).toHaveLength(DEFAULT_BLOCK_ORDER.length);
  });

  it("drops unknown ids (forward compat with renamed/removed blocks)", () => {
    expect(mergeOrder(["stats", "bogus", "donut"])).toEqual(["stats", "donut", "table"]);
  });

  it("dedupes repeated ids", () => {
    expect(mergeOrder(["stats", "stats", "donut"])).toEqual(["stats", "donut", "table"]);
  });

  it("falls back to defaults on garbage input instead of throwing", () => {
    expect(mergeOrder("nope")).toEqual(DEFAULT_BLOCK_ORDER);
    expect(mergeOrder(null)).toEqual(DEFAULT_BLOCK_ORDER);
    expect(mergeOrder(42)).toEqual(DEFAULT_BLOCK_ORDER);
  });
});

describe("useExplorerLayout", () => {
  it("starts with default order and hydrates to default when storage is empty", async () => {
    const { result } = renderHook(() => useExplorerLayout(USER_ID));

    // First render: hydration hasn't completed, but order is at least the
    // canonical default (so the page never renders with an empty array).
    expect(DEFAULT_BLOCK_ORDER).toContain(result.current.order[0]);

    // After microtasks resolve, hydrate sets order from empty storage
    // → still defaults.
    await act(async () => {});
    expect(result.current.order).toEqual(DEFAULT_BLOCK_ORDER);
  });

  it("restores stored order on hydration", async () => {
    window.localStorage.setItem(
      `mf.explorerLayout.${USER_ID}`,
      JSON.stringify(["donut", "table", "stats"]),
    );

    const { result } = renderHook(() => useExplorerLayout(USER_ID));
    await act(async () => {});

    expect(result.current.order).toEqual(["donut", "table", "stats"]);
  });

  it("persists new order via setOrder", async () => {
    const { result } = renderHook(() => useExplorerLayout(USER_ID));
    await act(async () => {});

    act(() => {
      result.current.setOrder(["table", "stats", "donut"]);
    });

    expect(result.current.order).toEqual(["table", "stats", "donut"]);
    expect(JSON.parse(
      window.localStorage.getItem(`mf.explorerLayout.${USER_ID}`)!,
    )).toEqual(["table", "stats", "donut"]);
  });

  it("reset() restores the canonical default order AND clears the user's stored preference", async () => {
    window.localStorage.setItem(
      `mf.explorerLayout.${USER_ID}`,
      JSON.stringify(["donut", "stats", "table"]),
    );

    const { result } = renderHook(() => useExplorerLayout(USER_ID));
    await act(async () => {});
    expect(result.current.order).toEqual(["donut", "stats", "table"]);

    act(() => {
      result.current.reset();
    });

    expect(result.current.order).toEqual(DEFAULT_BLOCK_ORDER);
    expect(JSON.parse(
      window.localStorage.getItem(`mf.explorerLayout.${USER_ID}`)!,
    )).toEqual(DEFAULT_BLOCK_ORDER);
  });

  it("when userId is null, sits in defaults and does not touch localStorage", async () => {
    const { result } = renderHook(() => useExplorerLayout(null));
    await act(async () => {});

    act(() => {
      result.current.setOrder(["donut", "stats", "table"]);
    });

    expect(result.current.order).toEqual(["donut", "stats", "table"]);
    // Nothing was written to storage — no key for a null user.
    expect(window.localStorage.getItem("mf.explorerLayout.null")).toBeNull();
    expect(window.localStorage.length).toBe(0);
  });

  it("garbage JSON in storage falls back to defaults without throwing", async () => {
    window.localStorage.setItem(`mf.explorerLayout.${USER_ID}`, "{not-json");

    const { result } = renderHook(() => useExplorerLayout(USER_ID));
    await act(async () => {});

    expect(result.current.order).toEqual(DEFAULT_BLOCK_ORDER);
  });
});
