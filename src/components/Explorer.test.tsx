import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toISO, addDays, todayDate } from "@/lib/dateRange";
import type { Food } from "@/lib/types";

// NavUser (sidebar footer) and ChatView pull in Clerk hooks that need a
// ClerkProvider; stub them out so Explorer can mount standalone.
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      imageUrl: "",
    },
  }),
  useClerk: () => ({ signOut: vi.fn() }),
}));

// Heavy siblings that are irrelevant to the stats cards under test.
vi.mock("@/components/ChatView", () => ({ ChatView: () => null }));
vi.mock("@/components/TrendsView", () => ({ TrendsView: () => null }));
vi.mock("@/components/CalorieShareDonut", () => ({ CalorieShareDonut: () => null }));

import { Explorer } from "@/components/Explorer";

function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    name: "Oats",
    calDensity: 2,
    timesEaten: 5,
    totalWeight: 100,
    totalCalories: 200,
    proteinPer100g: 10,
    fatPer100g: 5,
    carbPer100g: 60,
    proteinPct: 20,
    fatPct: 20,
    carbPct: 60,
    category: "carb",
    zone: "medium",
    avgPortion: 50,
    impactScore: 10,
    ...overrides,
  };
}

type Deferred = {
  startDate: string;
  resolve: (foods: Food[]) => void;
  reject: (err: unknown) => void;
  aborted: boolean;
};

/**
 * Mocks fetch for the three endpoints Explorer hits:
 *  - /api/date-range     → resolves immediately (bounds: last 30 days)
 *  - /api/foods (current period, startDate >= initial range start)
 *                        → resolves immediately with `currentFoods`
 *  - /api/foods (previous period, startDate before the current range)
 *                        → stays pending until the test resolves it,
 *                          and rejects with AbortError on signal abort
 *                          (matching real fetch semantics)
 */
function installFetchMock(currentFoods: Food[]) {
  const today = todayDate();
  const bounds = { min: toISO(addDays(today, -30)), max: toISO(today) };
  const prevFetches: Deferred[] = [];

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), "http://localhost");
    const json = (data: unknown) =>
      Promise.resolve({ json: () => Promise.resolve(data) } as Response);

    if (url.pathname === "/api/date-range") {
      return json(bounds);
    }
    if (url.pathname === "/api/foods") {
      const startDate = url.searchParams.get("startDate")!;
      const endDate = url.searchParams.get("endDate")!;
      // Every preset range ends today; a previous-period range always
      // ends before the selected range starts, i.e. before today.
      if (endDate === toISO(today)) {
        return json({ foods: currentFoods });
      }
      // Previous-period fetch: test-controlled.
      return new Promise<Response>((resolve, reject) => {
        const deferred: Deferred = {
          startDate,
          resolve: (foods) =>
            resolve({ json: () => Promise.resolve({ foods }) } as Response),
          reject,
          aborted: false,
        };
        init?.signal?.addEventListener("abort", () => {
          deferred.aborted = true;
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
        prevFetches.push(deferred);
      });
    }
    throw new Error(`Unexpected fetch: ${url.pathname}`);
  });

  vi.stubGlobal("fetch", fetchMock);
  return { prevFetches };
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("Explorer → Average Density card (bug #58)", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the 'comparing to previous period…' loading caption while the previous-period fetch is in flight, then the ±% trend", async () => {
    // Current period avg density = 200/100 = 2.00
    const { prevFetches } = installFetchMock([makeFood()]);

    render(<Explorer />);

    // Cards appear once bounds + current-period foods resolve; the
    // previous-period fetch is still pending at that point.
    await screen.findByText("Average Density");
    expect(
      screen.getByText(/comparing to previous period/i),
    ).toBeInTheDocument();
    // The static fallback caption must NOT be shown while loading.
    expect(screen.queryByText(/calories per gram/i)).not.toBeInTheDocument();

    // Resolve the previous period: avg = 160/100 = 1.60 → +25.0% trend.
    expect(prevFetches).toHaveLength(1);
    await act(async () => {
      prevFetches[0].resolve([makeFood({ totalCalories: 160 })]);
    });

    expect(
      await screen.findByText(/\+25\.0% vs previous period/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/comparing to previous period/i),
    ).not.toBeInTheDocument();
  });

  it("keeps the loading caption when a range switch aborts the in-flight previous-period fetch", async () => {
    const user = userEvent.setup();
    const { prevFetches } = installFetchMock([makeFood()]);

    render(<Explorer />);
    await screen.findByText("Average Density");
    expect(prevFetches).toHaveLength(1);

    // Switch the date range while the first previous-period fetch is
    // still pending — Explorer aborts it and starts a new one.
    await user.click(screen.getByText("30 d"));
    await flush();

    expect(prevFetches).toHaveLength(2);
    expect(prevFetches[0].aborted).toBe(true);

    // The aborted fetch's cleanup must not clobber the successor's
    // loading state: the caption still shows the in-flight state.
    expect(
      screen.getByText(/comparing to previous period/i),
    ).toBeInTheDocument();

    // Resolve the successor: avg = 100/100 = 1.00 → +100.0% trend.
    await act(async () => {
      prevFetches[1].resolve([makeFood({ totalCalories: 100 })]);
    });
    expect(
      await screen.findByText(/\+100\.0% vs previous period/i),
    ).toBeInTheDocument();
  });
});
