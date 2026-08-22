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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom 4-Color Pastel Rose & Lilac Palette
        blush: {
          50: "#FFFFFF",
          100: "#FBEFEF", // Base Blush Canvas
          200: "#FFE2E2", // Soft Rose Panel
          300: "#F5CBCB", // Dusty Rose Quartz Accent
          400: "#e5adad",
          500: "#d48e8e",
        },
        lilac: {
          50: "#FAF7FC",
          100: "#F2EBF6",
          200: "#E3D5EC",
          300: "#C5B3D3", // Lavender Lilac Accent
          400: "#AB93BF",
          500: "#9174AA",
          600: "#75568F",
        },
        plum: {
          950: "#180E1A",
          900: "#27172B", // Deep Plum for text & high-contrast elements
          850: "#321E37",
          800: "#422849",
          700: "#5A3863",
          600: "#744B7F",
          500: "#90619C",
        },
      },
    },
  },
  plugins: [],
};
export default config;
