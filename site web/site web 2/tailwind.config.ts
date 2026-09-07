import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: "#2E7D32",
            dark: "#1B5E20",
            light: "#4CAF50",
          },
          secondary: {
            DEFAULT: "#81C784",
            light: "#A5D6A7",
            dark: "#66BB6A",
          },
          accent: {
            DEFAULT: "#FBC02D",
            light: "#FDD835",
            dark: "#F57F17",
          },
          dark: "#263238",
          muted: "#757575",
          surface: "#F8F9FA",
          card: "#FFFFFF",
          border: "#E0E0E0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
