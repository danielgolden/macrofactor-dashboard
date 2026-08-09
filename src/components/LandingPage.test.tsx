import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingPage } from "@/components/LandingPage";

const clerk = vi.hoisted(() => ({ signedIn: false }));

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) =>
    clerk.signedIn ? <>{children}</> : null,
  SignedOut: ({ children }: { children: React.ReactNode }) =>
    clerk.signedIn ? null : <>{children}</>,
}));

vi.mock("@/lib/fonts", () => ({
  lastik: { variable: "mock-font-variable" },
}));

describe("LandingPage", () => {
  beforeEach(() => {
    clerk.signedIn = false;
  });

  it("renders the hero headline, subhead, and why section", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /your food log has more to tell you/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/revealing the patterns behind your eating habits/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /your data,\s*finally working\s*for you/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/logging everything you eat in macrofactor/i)
    ).toBeInTheDocument();
  });

  it("renders all six feature titles and the three how-it-works steps", () => {
    render(<LandingPage />);

    for (const title of [
      "Food Explorer",
      "Density vs. Portion",
      "Monthly Ranking",
      "Calorie Map",
      "Trends",
    ]) {
      // Titles appear both in cards and in the footer checklist
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }
    // AI Chat appears as a kicker label
    expect(screen.getAllByText("AI Chat").length).toBeGreaterThan(0);

    for (const step of [
      "Export your food log",
      "Sign in with Google",
      "Import and explore",
    ]) {
      expect(screen.getByRole("heading", { name: step })).toBeInTheDocument();
    }
  });

  it("showcases the app UI screenshots", () => {
    render(<LandingPage />);

    expect(screen.getByAltText(/food explorer table/i)).toHaveAttribute(
      "src",
      expect.stringContaining("explorer")
    );
    expect(screen.getByAltText(/macro split over time/i)).toHaveAttribute(
      "src",
      expect.stringContaining("trends")
    );
  });

  it("links signed-out visitors to /sign-in", () => {
    render(<LandingPage />);

    const signInLinks = screen.getAllByRole("link", {
      name: /sign in|get started/i,
    });
    expect(signInLinks.length).toBeGreaterThan(0);
    for (const link of signInLinks) {
      expect(link).toHaveAttribute("href", "/sign-in");
    }
    expect(
      screen.queryByRole("link", { name: /open app/i })
    ).not.toBeInTheDocument();
  });

  it("links signed-in users to /app instead of /sign-in", () => {
    clerk.signedIn = true;
    render(<LandingPage />);

    const openAppLinks = screen.getAllByRole("link", { name: /open app/i });
    expect(openAppLinks.length).toBeGreaterThan(0);
    for (const link of openAppLinks) {
      expect(link).toHaveAttribute("href", "/app");
    }
    expect(
      screen.queryByRole("link", { name: /sign in|get started/i })
    ).not.toBeInTheDocument();
  });
});
