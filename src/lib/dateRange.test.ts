import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toISO, PRESETS, todayDate } from "@/lib/dateRange";

// Reproduce the #57 bug: a local-midnight Date must serialize to its own
// calendar day regardless of the host time zone. The previous `toISO` used
// `d.toISOString().slice(0, 10)` (UTC), which shifted every date back one
// day for users at a positive UTC offset (UTC+1 and east).
//
// Node re-reads `process.env.TZ` at runtime, so toggling it between tests
// is sufficient. We restore the original TZ afterward so we don't leak
// state into the rest of the suite.

const TZ_BACKUP = process.env.TZ;

function setTZ(tz: string) {
  process.env.TZ = tz;
}

describe("toISO (#57 — local-midnight serializes to its own calendar day)", () => {
  afterEach(() => {
    process.env.TZ = TZ_BACKUP;
  });

  it("serializes a local-midnight Date to its own day under America/New_York", () => {
    setTZ("America/New_York");
    const d = new Date(2026, 7, 11); // local midnight Aug 11, 2026
    expect(toISO(d)).toBe("2026-08-11");
  });

  it("serializes a local-midnight Date to its own day under Europe/Madrid", () => {
    setTZ("Europe/Madrid");
    const d = new Date(2026, 7, 11); // 2026-08-11T00:00:00+0200 → 22:00Z the day before
    // Confirm the bug precondition: UTC conversion lands on Aug 10.
    expect(d.toISOString().slice(0, 10)).toBe("2026-08-10");
    // And that toISO uses local time, not UTC.
    expect(toISO(d)).toBe("2026-08-11");
  });

  it("the Today preset returns today's local date under America/New_York", () => {
    setTZ("America/New_York");
    vi.setSystemTime(new Date(2026, 7, 11, 9, 30, 0)); // 9:30 AM local
    try {
      const today = todayDate();
      expect(toISO(today)).toBe("2026-08-11");
      const range = PRESETS.find((p) => p.label === "Today")!.range();
      expect(range).toEqual({ start: "2026-08-11", end: "2026-08-11" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("the Today preset returns today's local date under Europe/Madrid", () => {
    setTZ("Europe/Madrid");
    vi.setSystemTime(new Date(2026, 7, 11, 9, 30, 0)); // 9:30 AM local
    try {
      const today = todayDate();
      // Sanity: midnight-local must serialize via local time, not UTC.
      expect(toISO(today)).toBe("2026-08-11");
      const range = PRESETS.find((p) => p.label === "Today")!.range();
      expect(range).toEqual({ start: "2026-08-11", end: "2026-08-11" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("the 7 d preset spans seven local days under Europe/Madrid", () => {
    setTZ("Europe/Madrid");
    vi.setSystemTime(new Date(2026, 7, 11, 23, 59, 0));
    try {
      const range = PRESETS.find((p) => p.label === "7 d")!.range();
      expect(range.start).toBe("2026-08-05");
      expect(range.end).toBe("2026-08-11");
    } finally {
      vi.useRealTimers();
    }
  });
});
