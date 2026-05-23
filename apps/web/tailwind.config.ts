import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        bricolage: ["var(--font-bricolage)", "sans-serif"],
      },
      colors: {
        brand: {
          dark: "#1A1A2E",
          "dark-hover": "#16163a",
          accent: "#F97316",
          "accent-hover": "#EA580C",
          bg: "#F5F5F7",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
