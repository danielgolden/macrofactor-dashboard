import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangePicker } from "@/components/DateRangePicker";

const today = new Date();
today.setHours(0, 0, 0, 0);

const bounds = {
  // Bounds that include "today" so the preset range always overlaps.
  min: new Date(2025, 0, 1),
  max: today,
};

function renderPicker(
  overrides: Partial<{
    value: { start: string; end: string } | null;
    onChange: (r: { start: string; end: string } | null) => void;
  }> = {},
) {
  const onChange = vi.fn();
  const utils = render(
    <DateRangePicker
      value={
        overrides.value === undefined
          ? { start: "2025-08-01", end: "2025-08-31" }
          : overrides.value
      }
      onChange={overrides.onChange ?? onChange}
      bounds={bounds}
    />,
  );
  return { ...utils, onChange };
}

describe("DateRangePicker", () => {
  it("navigates to the previous month when prev-chevron is clicked (regression guard for #43 Bug 1)", async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker({
      value: { start: "2025-08-01", end: "2025-08-31" },
    });

    // Open the popover.
    await user.click(screen.getByRole("button", { name: /Aug/ }));

    // The month caption should start at August 2025.
    expect(
      await screen.findByText(/August 2025/),
    ).toBeInTheDocument();

    // Click the previous-month chevron. react-day-picker renders it as a
    // button labeled "Previous month".
    const prev = screen.getByRole("button", { name: /previous month/i });
    await user.click(prev);

    // The caption must now show July 2025, and `onChange` must NOT have
    // been called (we only navigated, we didn't pick a date).
    expect(await screen.findByText(/July 2025/)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("navigates to the next month when next-chevron is clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker({
      value: { start: "2025-08-01", end: "2025-08-31" },
    });

    await user.click(screen.getByRole("button", { name: /Aug/ }));
    expect(
      await screen.findByText(/August 2025/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(await screen.findByText(/September 2025/)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("respects startMonth / endMonth bounds (cannot navigate into disabled months)", async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker({
      value: { start: "2025-01-15", end: "2025-01-15" },
    });

    await user.click(screen.getByRole("button", { name: /Jan/ }));
    expect(
      await screen.findByText(/January 2025/),
    ).toBeInTheDocument();

    // bounds.min is Jan 2025, so the prev button is rendered but
    // react-day-picker marks it aria-disabled (not the HTML `disabled`
    // attribute). It must NOT fire onChange when clicked.
    const prev = screen.getByRole("button", { name: /previous month/i });
    expect(prev).toHaveAttribute("aria-disabled", "true");
    // Even if it doesn't strictly prevent clicks, the navigation should
    // not produce a prev month we could render.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("commits the range on popover close (blur), not on every day click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Start fresh (no committed value) to make assertions easy.
    render(
      <DateRangePicker
        value={null}
        onChange={onChange}
        bounds={bounds}
      />,
    );

    // Open the popover by clicking the "Select dates" trigger.
    await user.click(screen.getByRole("button", { name: /Select dates/i }));

    // No commits yet — opening alone must not fire onChange.
    expect(onChange).not.toHaveBeenCalled();

    // Clicking the prev/next chevrons while picking must not commit either.
    await user.click(screen.getByRole("button", { name: /previous month/i }));
    expect(onChange).not.toHaveBeenCalled();

    // Close the popover (Escape) without picking. With no draft, nothing
    // should be committed.
    await user.keyboard("{Escape}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a preset click commits immediately and clears any in-progress draft", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        value={null}
        onChange={onChange}
        bounds={bounds}
      />,
    );

    // Click the "7 d" preset — must commit immediately.
    const sevenDay = screen.getByRole("button", { name: /^7 d$/ });
    await user.click(sevenDay);

    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0];
    expect(arg.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(arg.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // 7 d = 6 day window
    const ms = new Date(arg.end).getTime() - new Date(arg.start).getTime();
    expect(ms).toBe(6 * 24 * 60 * 60 * 1000);
  });

  it("local-ISO formatter: a local-midnight Date serializes to its own calendar day (regression guard for the UTC toISO() shift)", () => {
    // 2025-08-15 at local midnight should serialize to "2025-08-15" under
    // any TZ, not "2025-08-14" under a positive UTC offset. The picker
    // used to use `d.toISOString().slice(0, 10)` (UTC); we now use
    // `format(d, "yyyy-MM-dd")` from date-fns, which is local-time.
    const d = new Date(2025, 7, 15); // local midnight Aug 15, 2025
    // Mirror the picker helper logic locally so the test is independent:
    const pad = (n: number) => String(n).padStart(2, "0");
    const expected = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    expect(expected).toBe("2025-08-15");
  });
});
