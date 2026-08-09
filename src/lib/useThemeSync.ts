"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";

/**
 * Syncs the theme preference to/from the server.
 *
 * On mount: fetches the user's saved theme from /api/preferences and applies it.
 * On change: when the user picks a new theme, saves it to the server via PUT.
 *
 * For unauthenticated users, falls back to next-themes' localStorage behavior.
 */
export function useThemeSync() {
  const { setTheme, theme } = useTheme();
  const { isSignedIn } = useUser();
  const fetchedRef = useRef(false);
  const lastSyncedRef = useRef<string | null>(null);

  // Load saved theme from server on mount
  useEffect(() => {
    if (!isSignedIn || fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.theme) {
          setTheme(data.theme);
          lastSyncedRef.current = data.theme;
        }
      })
      .catch((err) => console.error("Failed to load theme:", err));
  }, [isSignedIn, setTheme]);

  // Save theme to server when it changes
  useEffect(() => {
    if (!isSignedIn || !theme) return;
    if (theme === lastSyncedRef.current) return;
    lastSyncedRef.current = theme;

    fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    }).catch((err) => console.error("Failed to save theme:", err));
  }, [theme, isSignedIn]);
}
