import preset from "@btc-ui/tailwind-preset"
import type { Config } from "tailwindcss"

const config: Config = {
  presets: [preset],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./content/**/*.{md,mdx}",
    "./registry/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
}

export default config
