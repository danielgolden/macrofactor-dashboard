import "@testing-library/jest-dom/vitest";

// jsdom does not implement window.matchMedia by default. The
// `useIsMobile` hook in src/hooks/use-mobile.ts calls it on mount; if
// it's missing, every component that renders the date range picker (and
// any future component that uses useIsMobile) will throw in tests.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
