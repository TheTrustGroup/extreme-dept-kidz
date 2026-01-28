import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Neutral luxury palette
        cream: {
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
        charcoal: {
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
        // Bold accent - deep navy
        navy: {
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
        // Alternative accent - forest green
        forest: {
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
        // Premium warm accents – honey (badges, highlights), blush (trust), sage (success)
        honey: {
          50: "#fefaf3",
          100: "#fdf3e3",
          200: "#f9e6c8",
          300: "#f0d4a8",
          400: "#e0b87a",
          500: "#c9a227",
          600: "#a8841f",
        },
        blush: {
          50: "#fdf8f6",
          100: "#f9ede8",
          200: "#f0ddd5",
          300: "#e4c9be",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e6ede6",
          500: "#5a7d5a",
          600: "#4a6b4a",
        },
        // Dark Theme System - Premium dark palette with orange accents
        dark: {
          bg: {
            primary: "#0b0f1a",
            secondary: "#0f1629",
          },
          surface: {
            DEFAULT: "rgba(255, 255, 255, 0.08)",
            strong: "rgba(255, 255, 255, 0.12)",
          },
          border: {
            glass: "rgba(255, 255, 255, 0.18)",
          },
          text: {
            primary: "#ffffff",
            secondary: "rgba(255, 255, 255, 0.7)",
            muted: "rgba(255, 255, 255, 0.45)",
          },
        },
        accent: {
          primary: "#ff7a18",
          secondary: "#ffd36b",
          soft: "rgba(255, 122, 24, 0.15)",
        },
      },
      spacing: {
        // Luxury spacing scale - generous and elegant
        "18": "4.5rem", // 72px
        "22": "5.5rem", // 88px
        "26": "6.5rem", // 104px
        "30": "7.5rem", // 120px
        "34": "8.5rem", // 136px
        "38": "9.5rem", // 152px
        "42": "10.5rem", // 168px
        "46": "11.5rem", // 184px
        "50": "12.5rem", // 200px
      },
      fontSize: {
        // Premium type scale – caption to display (see docs/DESIGN_SYSTEM_PALETTE_TYPOGRAPHY.md)
        "caption": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        "small": ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        "lead": ["1.125rem", { lineHeight: "1.55", letterSpacing: "0" }],
        "h4": ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "h3": ["1.5rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        "h2": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "h1": ["2.25rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        // Display sizes for hero and section titles
        "display-2xl": [
          "4.5rem",
          { lineHeight: "1.08", letterSpacing: "-0.02em" },
        ],
        "display-xl": [
          "3.75rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-md": [
          "2.25rem",
          { lineHeight: "1.3", letterSpacing: "-0.01em" },
        ],
        "display-sm": ["1.875rem", { lineHeight: "1.4", letterSpacing: "0" }],
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        // Design System: Shadow levels (Tier 2)
        'sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'navy': '0 4px 12px rgba(16, 42, 67, 0.3)',
        // Glassmorphism: soft, layered depth
        'glass': '0 8px 32px rgba(26, 26, 26, 0.08)',
        'glass-lg': '0 12px 40px rgba(26, 26, 26, 0.12)',
        'glass-xl': '0 16px 48px rgba(26, 26, 26, 0.14)',
        // Dark theme shadows
        'dark-soft': '0 6px 24px rgba(0, 0, 0, 0.25)',
        'dark-medium': '0 10px 40px rgba(0, 0, 0, 0.35)',
        'dark-strong': '0 18px 70px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        xs: '6px',
        sm: '12px',
        md: '18px',
        lg: '28px',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '22px',
        xl: '30px',
      },
      transitionDuration: {
        // Design System: Animation timing (Tier 2)
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
        // Dark theme transitions
        'transition-fast': '120ms',
        'transition-base': '220ms',
        'transition-smooth': '400ms',
      },
      transitionTimingFunction: {
        // Design System: Easing functions
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        // Dark theme easing
        'transition-fast': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-base': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        // Smooth animation presets
        "fade-in": "fadeIn 0.6s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-right": "slideInRight 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "smooth-float": "smoothFloat 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        smoothFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
