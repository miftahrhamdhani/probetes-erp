import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#e30613",
          deep: "#0b1220",
          muted: "#667085",
          header: "#f6f7f9",
          page: "#f3f5f8"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(15, 23, 42, 0.08)",
        card: "0 12px 35px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
