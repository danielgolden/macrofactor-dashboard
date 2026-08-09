import localFont from "next/font/local";

/**
 * Lastik — editorial serif used for display headlines on the public landing
 * and sign-in pages. Loaded locally (test family); SemiBold covers `.display`
 * and `.serifSmall`, SemiBoldItalic covers the `em` accent.
 */
export const lastik = localFont({
  src: [
    {
      path: "../fonts/lastik-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/lastik-semibolditalic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-display",
  display: "swap",
});
