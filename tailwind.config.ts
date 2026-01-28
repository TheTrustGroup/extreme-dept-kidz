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
        // COLOR SYSTEM NORMALIZATION: Brand tokens - single source of truth
        brand: {
          bg: "var(--brand-bg)",
          primary: "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
          text: "var(--brand-text)",
        },
        // Legacy color mappings - reference CSS variables from tokens.css
        cream: {
          50: "var(--color-cream-50)",
          100: "var(--color-cream-100)",
          200: "var(--color-cream-200)",
          300: "var(--color-cream-300)",
          400: "var(--color-cream-400)",
          500: "var(--color-cream-500)",
          600: "var(--color-cream-600)",
          700: "var(--color-cream-700)",
          800: "var(--color-cream-800)",
          900: "var(--color-cream-900)",
        },
        charcoal: {
          50: "var(--color-charcoal-50)",
          100: "var(--color-charcoal-100)",
          200: "var(--color-charcoal-200)",
          300: "var(--color-charcoal-300)",
          400: "var(--color-charcoal-400)",
          500: "var(--color-charcoal-500)",
          600: "var(--color-charcoal-600)",
          700: "var(--color-charcoal-700)",
          800: "var(--color-charcoal-800)",
          900: "var(--color-charcoal-900)",
          950: "var(--color-charcoal-950)",
        },
        // Bold accent - deep navy - COLOR SYSTEM NORMALIZATION: Maps to brand-primary
        navy: {
          50: "var(--color-navy-50)",
          100: "var(--color-navy-100)",
          200: "var(--color-navy-200)",
          300: "var(--color-navy-300)",
          400: "var(--color-navy-400)",
          500: "var(--color-navy-500)",
          600: "var(--color-navy-600)",
          700: "var(--color-navy-700)",
          800: "var(--color-navy-800)",
          900: "var(--color-navy-900)",
          950: "var(--color-navy-950)",
        },
        // Alternative accent - forest green
        forest: {
          50: "var(--color-forest-50)",
          100: "var(--color-forest-100)",
          200: "var(--color-forest-200)",
          300: "var(--color-forest-300)",
          400: "var(--color-forest-400)",
          500: "var(--color-forest-500)",
          600: "var(--color-forest-600)",
          700: "var(--color-forest-700)",
          800: "var(--color-forest-800)",
          900: "var(--color-forest-900)",
          950: "var(--color-forest-950)",
        },
        // Premium warm accents – honey (badges, highlights) - COLOR SYSTEM NORMALIZATION: Maps to brand-secondary
        honey: {
          50: "var(--color-honey-50)",
          100: "var(--color-honey-100)",
          200: "var(--color-honey-200)",
          300: "var(--color-honey-300)",
          400: "var(--color-honey-400)",
          500: "var(--color-honey-500)",
          600: "var(--color-honey-600)",
        },
        blush: {
          50: "var(--color-blush-50)",
          100: "var(--color-blush-100)",
          200: "var(--color-blush-200)",
          300: "var(--color-blush-300)",
        },
        sage: {
          50: "var(--color-sage-50)",
          100: "var(--color-sage-100)",
          500: "var(--color-sage-500)",
          600: "var(--color-sage-600)",
        },
        // Dark Theme System - Premium dark palette
        dark: {
          bg: {
            primary: "var(--color-bg-primary, #0b0f1a)",
            secondary: "var(--color-bg-secondary, #0f1629)",
          },
          surface: {
            DEFAULT: "var(--color-surface, rgba(255, 255, 255, 0.08))",
            strong: "var(--color-surface-strong, rgba(255, 255, 255, 0.12))",
          },
          border: {
            glass: "var(--color-border-glass, rgba(255, 255, 255, 0.18))",
          },
          text: {
            primary: "var(--color-text-primary, #ffffff)",
            secondary: "var(--color-text-secondary, rgba(255, 255, 255, 0.7))",
            muted: "var(--color-text-muted, rgba(255, 255, 255, 0.45))",
          },
        },
        accent: {
          primary: "var(--accent-primary, #ff7a18)",
          secondary: "var(--accent-secondary, #ffd36b)",
          soft: "var(--accent-soft, rgba(255, 122, 24, 0.15))",
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
        // Design System: Shadow levels - COLOR SYSTEM NORMALIZATION: Use brand tokens
        'sm': '0 1px 3px rgba(28, 28, 28, 0.08)', // brand-text with 8% opacity
        'md': '0 4px 12px rgba(28, 28, 28, 0.1)', // brand-text with 10% opacity
        'lg': '0 8px 24px rgba(28, 28, 28, 0.12)', // brand-text with 12% opacity
        'xl': '0 12px 40px rgba(28, 28, 28, 0.15)', // brand-text with 15% opacity
        'navy': '0 4px 12px rgba(11, 31, 54, 0.3)', // brand-primary with 30% opacity
        // Glassmorphism: soft, layered depth - COLOR SYSTEM NORMALIZATION: Use CSS variables
        'glass': 'var(--glass-shadow)',
        'glass-lg': 'var(--glass-shadow-elevated)',
        'glass-xl': '0 16px 48px rgba(28, 28, 28, 0.14)', // brand-text with 14% opacity
        // Dark theme shadows
        'dark-soft': 'var(--shadow-soft)',
        'dark-medium': 'var(--shadow-medium)',
        'dark-strong': 'var(--shadow-strong)',
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
