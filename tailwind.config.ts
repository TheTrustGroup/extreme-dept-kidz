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
        // Large display sizes for luxury typography
        "display-2xl": [
          "4.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-xl": [
          "3.75rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
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
