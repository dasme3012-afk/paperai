import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151516",
        paper: "#f7f5ef",
        line: "#dedad0",
        brand: "#2563eb",
        mint: "#0f9f8f",
        coral: "#e85d44"
      },
      boxShadow: {
        page: "0 18px 60px rgba(21, 21, 22, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
