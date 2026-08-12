import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Behavior tests for the page-chunk prefetch caches that parallelize the
// initial /api/foods and /api/date-range requests with the Explorer chunk
// download. The caches live in module state, so each test re-imports the
// modules fresh via vi.resetModules() + dynamic import.
//
// Covered contracts:
//  - a prefetch started before the hook mounts is consumed in-flight, so the
//    dashboard issues exactly one network request per endpoint;
//  - the caches are one-shot: after consumption/settle a remount fetches
//    fresh (no stale bounds/foods replay after a data import);
//  - a rejected foods prefetch is observed by the cache's own settle handler
//    (no unhandled rejection) and the error still surfaces through useFoods.

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (e: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function jsonResponse(body: unknown): Response {
  return { json: () => Promise.resolve(body) } as unknown as Response;
}

const RANGE = { start: "2026-08-06", end: "2026-08-12" };
const FOODS = [
  { id: "1", name: "Oats", calories: 300 },
  { id: "2", name: "Eggs", calories: 210 },
];

async function importFoodsModule() {
  vi.resetModules();
  return await import("@/lib/useFoods");
}

async function importBoundsModule() {
  vi.resetModules();
  return await import("@/lib/useDateRangeBounds");
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("prefetchFoods + useFoods", () => {
  it("consumes an in-flight prefetch for the same range without a duplicate request", async () => {
    const { prefetchFoods, useFoods } = await importFoodsModule();

    const d = deferred<Response>();
    fetchMock.mockReturnValueOnce(d.promise);

    prefetchFoods(RANGE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "startDate=2026-08-06&endDate=2026-08-12&all=true",
    );

    // Mount while the prefetch is still in flight — the common case where the
    // Explorer chunk finishes downloading before /api/foods responds.
    const { result } = renderHook(() => useFoods(RANGE));
    expect(result.current.loading).toBe(true);

    d.resolve(jsonResponse({ foods: FOODS }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.foods).toEqual(FOODS);
    expect(result.current.error).toBeNull();
    // The hook reused the prefetch instead of firing its own request.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("is one-shot: a later mount for the same range fetches fresh from the network", async () => {
    const { prefetchFoods, useFoods } = await importFoodsModule();

    fetchMock.mockResolvedValueOnce(jsonResponse({ foods: FOODS }));
    prefetchFoods(RANGE);

    const first = renderHook(() => useFoods(RANGE));
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(first.result.current.foods).toEqual(FOODS);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    first.unmount();

    // e.g. remount after a data import: must hit the network, not replay
    // the already-consumed prefetch.
    const freshFoods = [{ id: "3", name: "Rice", calories: 400 }];
    fetchMock.mockResolvedValueOnce(jsonResponse({ foods: freshFoods }));
    const second = renderHook(() => useFoods(RANGE));
    await waitFor(() => expect(second.result.current.loading).toBe(false));
    expect(second.result.current.foods).toEqual(freshFoods);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("a mismatched range ignores the prefetch and fetches its own data", async () => {
    const { prefetchFoods, useFoods } = await importFoodsModule();

    const prefetchDeferred = deferred<Response>();
    fetchMock.mockReturnValueOnce(prefetchDeferred.promise);
    prefetchFoods(RANGE);

    const otherRange = { start: "2026-07-01", end: "2026-07-31" };
    fetchMock.mockResolvedValueOnce(jsonResponse({ foods: FOODS }));
    const { result } = renderHook(() => useFoods(otherRange));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.foods).toEqual(FOODS);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "startDate=2026-07-01&endDate=2026-07-31",
    );
    // Leave no pending rejection behind.
    prefetchDeferred.resolve(jsonResponse({ foods: [] }));
  });

  it("a rejected prefetch is settled internally (no unhandled rejection) and self-evicts", async () => {
    const { prefetchFoods } = await importFoodsModule();

    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    try {
      fetchMock.mockRejectedValueOnce(new TypeError("network down"));
      const p = prefetchFoods(RANGE);
      // Observe the rejection ourselves so the *returned* promise is handled;
      // the cache's internal settle handler must cover the unconsumed case.
      const err = await p.catch((e: Error) => e);
      expect(err).toBeInstanceOf(TypeError);

      // Unhandled rejections are reported a macrotask after settle.
      await new Promise((r) => setTimeout(r, 20));
      expect(unhandled).not.toHaveBeenCalled();

      // The failed entry self-evicted: the next prefetch hits the network.
      fetchMock.mockResolvedValueOnce(jsonResponse({ foods: FOODS }));
      await expect(prefetchFoods(RANGE)).resolves.toEqual(FOODS);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });

  it("surfaces an API error from a consumed prefetch through the hook", async () => {
    const { prefetchFoods, useFoods } = await importFoodsModule();

    const d = deferred<Response>();
    fetchMock.mockReturnValueOnce(d.promise);
    prefetchFoods(RANGE);

    const { result } = renderHook(() => useFoods(RANGE));
    d.resolve(jsonResponse({ error: "Unauthorized" }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Unauthorized");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("prefetchDateRangeBounds + useDateRangeBounds", () => {
  it("consumes an in-flight bounds prefetch without a duplicate request", async () => {
    const { prefetchDateRangeBounds, useDateRangeBounds } =
      await importBoundsModule();

    const d = deferred<Response>();
    fetchMock.mockReturnValueOnce(d.promise);

    prefetchDateRangeBounds();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/date-range");

    const { result } = renderHook(() => useDateRangeBounds());
    expect(result.current.loading).toBe(true);

    d.resolve(jsonResponse({ min: "2026-01-05", max: "2026-08-12" }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bounds?.min.getFullYear()).toBe(2026);
    expect(result.current.bounds?.min.getMonth()).toBe(0);
    expect(result.current.bounds?.max.getMonth()).toBe(7);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not replay stale bounds: a remount after consumption fetches fresh", async () => {
    const { prefetchDateRangeBounds, useDateRangeBounds } =
      await importBoundsModule();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ min: "2026-01-05", max: "2026-08-01" }),
    );
    prefetchDateRangeBounds();

    const first = renderHook(() => useDateRangeBounds());
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(first.result.current.bounds?.max.getDate()).toBe(1);
    first.unmount();

    // Remount (e.g. navigating back after importing newer data): must fetch
    // fresh bounds instead of replaying the consumed prefetch result.
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ min: "2026-01-05", max: "2026-08-12" }),
    );
    const second = renderHook(() => useDateRangeBounds());
    await waitFor(() => expect(second.result.current.loading).toBe(false));
    expect(second.result.current.bounds?.max.getDate()).toBe(12);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("a failed bounds fetch resolves to no bounds and still finishes loading", async () => {
    const { prefetchDateRangeBounds, useDateRangeBounds } =
      await importBoundsModule();

    fetchMock.mockRejectedValueOnce(new TypeError("network down"));
    prefetchDateRangeBounds();

    const { result } = renderHook(() => useDateRangeBounds());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bounds).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
