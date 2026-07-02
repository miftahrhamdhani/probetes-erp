import type { Config } from "tailwindcss";

const preset = {
  theme: {
    extend: {
      colors: {
        probetes: {
          red: "#e30613",
          dark: "#0f172a",
          muted: "#5f6878",
          surface: "#f6f7f9"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(15, 23, 42, 0.08)"
      }
    }
  }
} satisfies Partial<Config>;

export default preset;
