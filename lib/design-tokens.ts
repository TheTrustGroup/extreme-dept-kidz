/**
 * Design Tokens for Extreme Dept Kidz
 * Luxury kids fashion brand design system
 */

export const designTokens = {
  colors: {
    primary: {
      50: "#f0f4f8",
      100: "#d9e2ec",
      200: "#bcccdc",
      300: "#9fb3c8",
      400: "#829ab1",
      500: "#627d98",
      600: "#486581",
      700: "#334e68",
      800: "#243b53",
      900: "#102a43",
      950: "#0a1a2a",
    },
    secondary: {
      50: "#f0f9f4",
      100: "#dcf2e3",
      200: "#bce5ca",
      300: "#8fd1a6",
      400: "#5ab57a",
      500: "#369a5a",
      600: "#277d47",
      700: "#21643a",
      800: "#1d5030",
      900: "#194229",
      950: "#0c2416",
    },
    neutral: {
      50: "#fefdfb",
      100: "#fdfbf6",
      200: "#faf7ed",
      300: "#f5f0e0",
      400: "#ede5d0",
      500: "#e0d5b8",
      600: "#d4c5a0",
      700: "#c4b088",
      800: "#a8966f",
      900: "#8a7856",
    },
    accent: {
      50: "#f6f6f6",
      100: "#e7e7e7",
      200: "#d1d1d1",
      300: "#b0b0b0",
      400: "#888888",
      500: "#6d6d6d",
      600: "#5d5d5d",
      700: "#4f4f4f",
      800: "#454545",
      900: "#3d3d3d",
      950: "#1a1a1a",
    },
  },
  typography: {
    fontFamily: {
      serif: "var(--font-playfair)",
      sans: "var(--font-inter)",
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
      sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
      base: ["1rem", { lineHeight: "1.6", letterSpacing: "0" }],
      lg: ["1.125rem", { lineHeight: "1.6", letterSpacing: "0" }],
      xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
      "2xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
      "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
      "4xl": ["2.25rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
      "5xl": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      "6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      "7xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    18: "4.5rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "none",
  },
  animation: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
      slower: "700ms",
    },
    easing: {
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
} as const;

export type DesignTokens = typeof designTokens;

/**
 * Compact density token profile.
 * Mirrors the mobile login reference: tight typography, small controls, restrained spacing.
 */
export const compactTokens = {
  color: {
    bg: {
      page: "#f6f6f6",
      surface: "#ffffff",
      inverse: "#121212",
      subtle: "#f1f1f1",
    },
    text: {
      primary: "#1e1e1e",
      secondary: "#5e5e5e",
      muted: "#9a9a9a",
      inverse: "#ffffff",
    },
    border: {
      subtle: "#e6e6e6",
      default: "#dddddd",
    },
    action: {
      primary: "#ef1a14",
      primaryHover: "#d91611",
      primaryText: "#ffffff",
    },
    focus: {
      ring: "#111111",
    },
  },
  typography: {
    fontSize: {
      xs: "11px",
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "20px",
      hero: "36px",
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      tight: "1.2",
      normal: "1.4",
      relaxed: "1.5",
    },
    letterSpacing: {
      tight: "-0.01em",
      normal: "0em",
      wideLabel: "0.08em",
    },
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
  },
  radius: {
    sm: "8px",
    md: "10px",
    lg: "12px",
    xl: "16px",
    full: "999px",
  },
  sizing: {
    controlHeightCompact: "42px",
    controlHeightDefault: "44px",
    inputPaddingX: "14px",
    mobileContentMax: "320px",
  },
  shadow: {
    button: "0 4px 10px rgba(0, 0, 0, 0.08)",
    card: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  motion: {
    durationFast: "120ms",
    durationNormal: "180ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;

export type CompactTokens = typeof compactTokens;

