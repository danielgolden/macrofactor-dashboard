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

// jsdom provides a working localStorage in modern versions; only stub it
// if it's somehow missing (e.g. a future SSR-only test config). When
// stubbed, the backing store is per-test-instance via `clear()` in
// beforeEach, which is what the useExplorerLayout tests rely on.
if (typeof window !== "undefined" && !window.localStorage) {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    },
  });
}
