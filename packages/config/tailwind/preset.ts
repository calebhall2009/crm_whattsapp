// ─────────────────────────────────────────────────────────────
// Tailwind CSS Preset — POS-Inspired Design System
//
// Visual direction: inspired by the physical world of commerce
// (receipts, cash registers, price tags, counters) — NOT
// generic SaaS blue/purple dashboards.
//
// Typography:
//   Display: Space Grotesk (geometric, modern personality)
//   Body:    Inter (clean professional readability)
//   Mono:    JetBrains Mono (receipt-like numbers, tabular)
//
// Colors:
//   Charcoal (#1A1A2E) — POS terminal frame
//   Amber    (#E8A838) — Price tag / receipt highlight
//   Sage     (#7C9A82) — Professional secondary accent
//   Rose     (#C4616C) — Error / void / danger
// ─────────────────────────────────────────────────────────────

import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // ── Brand palette ───────────────────────────────────
        charcoal: {
          50: "#F2F2F5",
          100: "#E5E5EB",
          200: "#C9C9D6",
          300: "#A8A8BF",
          400: "#7E7E9F",
          500: "#4A4A6A",
          600: "#2D2D48",
          700: "#22223A",
          800: "#1A1A2E",
          900: "#121220",
          950: "#0A0A14",
        },
        amber: {
          50: "#FEF6E7",
          100: "#FDE9C3",
          200: "#FBD68F",
          300: "#F5C05A",
          400: "#E8A838",
          500: "#D4912A",
          600: "#B3751F",
          700: "#8C5B18",
          800: "#664213",
          900: "#42290D",
          950: "#231607",
        },
        sage: {
          50: "#F0F4F1",
          100: "#DCE5DE",
          200: "#B8CBB9",
          300: "#9AB59D",
          400: "#7C9A82",
          500: "#638069",
          600: "#4E6652",
          700: "#3B4D3E",
          800: "#2A372C",
          900: "#1A221B",
          950: "#0D110E",
        },
        rose: {
          50: "#FCF0F1",
          100: "#F5D5D8",
          200: "#E8AAB0",
          300: "#D68088",
          400: "#C4616C",
          500: "#A84952",
          600: "#883A42",
          700: "#672C32",
          800: "#461E23",
          900: "#2C1316",
          950: "#170A0B",
        },
        // ── Neutral (warm tint for receipt/paper feel) ──────
        paper: {
          50: "#FAFAF8",
          100: "#F5F0EB",
          200: "#EBE5DD",
          300: "#D9D0C5",
          400: "#C4B8A9",
          500: "#A89B8B",
          600: "#8A7D6D",
          700: "#6B6155",
          800: "#4D463E",
          900: "#302C27",
          950: "#1A1816",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        // POS-specific sizes — larger for touch targets
        "pos-sm": ["0.8125rem", { lineHeight: "1.25rem" }],
        "pos-base": ["0.9375rem", { lineHeight: "1.5rem" }],
        "pos-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "pos-xl": ["1.375rem", { lineHeight: "1.875rem" }],
        "pos-2xl": ["1.75rem", { lineHeight: "2.25rem" }],
        "pos-price": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "pos-total": ["2.25rem", { lineHeight: "2.75rem", fontWeight: "700" }],
      },
      borderRadius: {
        card: "0.75rem",
        button: "0.5rem",
        tag: "0.375rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(26, 26, 46, 0.08), 0 1px 2px rgba(26, 26, 46, 0.04)",
        "card-hover":
          "0 4px 12px rgba(26, 26, 46, 0.10), 0 2px 4px rgba(26, 26, 46, 0.06)",
        receipt:
          "0 2px 8px rgba(26, 26, 46, 0.06), 0 0 0 1px rgba(26, 26, 46, 0.04)",
        terminal:
          "0 8px 32px rgba(26, 26, 46, 0.12), 0 2px 8px rgba(26, 26, 46, 0.06)",
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "receipt-print": "receipt-print 0.4s ease-out",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "receipt-print": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      // Touch-friendly minimum sizes
      spacing: {
        "touch": "2.75rem", // 44px — minimum touch target
        "touch-lg": "3.25rem", // 52px — comfortable touch target
      },
    },
  },
};

export default preset;
