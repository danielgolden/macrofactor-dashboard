import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controls } from "@/components/Controls";

function renderControls(overrides: Partial<{
  search: string;
  setSearch: (s: string) => void;
  activeZones: Set<any>;
  setActiveZones: (s: Set<any>) => void;
  activeCategories: Set<any>;
  setActiveCategories: (s: Set<any>) => void;
}> = {}) {
  const setSearch = vi.fn();
  const setActiveZones = vi.fn();
  const setActiveCategories = vi.fn();

  const utils = render(
    <Controls
      search={overrides.search ?? ""}
      setSearch={overrides.setSearch ?? setSearch}
      activeZones={overrides.activeZones ?? new Set()}
      setActiveZones={overrides.setActiveZones ?? setActiveZones}
      activeCategories={overrides.activeCategories ?? new Set()}
      setActiveCategories={overrides.setActiveCategories ?? setActiveCategories}
    />
  );

  return { ...utils, setSearch, setActiveZones, setActiveCategories };
}

describe("Controls combobox", () => {
  it("preserves input value when typing a query that doesn't match any filter option", async () => {
    const user = userEvent.setup();
    const { setSearch } = renderControls();

    const input = screen.getByPlaceholderText(/buscar alimentos/i);

    // Type "tee" — doesn't match any zone/category label
    await user.type(input, "tee");

    // The input should still contain "tee"
    expect(input).toHaveValue("tee");

    // setSearch should have been called with "tee" (not "")
    expect(setSearch).toHaveBeenLastCalledWith("tee");
  });

  it("preserves input value after typing a matching query then continuing to type a non-matching extension", async () => {
    const user = userEvent.setup();
    const { setSearch } = renderControls();

    const input = screen.getByPlaceholderText(/buscar alimentos/i);

    // "alt" matches "Alta" — popup opens
    await user.type(input, "alt");
    expect(input).toHaveValue("alt");

    // Continue typing "x" — "altx" no longer matches
    await user.type(input, "x");

    // Input should still contain "altx", not cleared
    await waitFor(() => {
      expect(input).toHaveValue("altx");
    });
    expect(setSearch).toHaveBeenLastCalledWith("altx");
  });

  it("preserves input value when pressing Enter", async () => {
    const user = userEvent.setup();
    const { setSearch } = renderControls();

    const input = screen.getByPlaceholderText(/buscar alimentos/i);

    await user.type(input, "tee");
    expect(input).toHaveValue("tee");

    await user.keyboard("{Enter}");

    // Input should still contain "tee" after Enter
    expect(input).toHaveValue("tee");
    expect(setSearch).toHaveBeenLastCalledWith("tee");
  });
});
