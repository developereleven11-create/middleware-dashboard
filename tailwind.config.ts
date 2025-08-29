import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7ff",
          100: "#e6efff",
          200: "#c5d9ff",
          300: "#a4c2ff",
          400: "#5b8bff",
          500: "#1f5cff",
          600: "#1747cc",
          700: "#103399",
          800: "#0a2266",
          900: "#051133"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
