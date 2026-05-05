import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        slateBlack: "#0b0f19",
        gunmetal: "#1a202c",
        neonRed: "#ff003c",
        neonBlue: "#00f0ff",
        neonGreen: "#00ff66",
      },
    },
  },
  plugins: [],
};
export default config;
