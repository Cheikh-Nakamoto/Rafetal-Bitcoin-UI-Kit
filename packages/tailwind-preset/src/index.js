/**
 * @btc-ui/tailwind-preset
 *
 * Drop into your tailwind.config.* as a preset:
 *
 *   import preset from "@btc-ui/tailwind-preset"
 *   export default { presets: [preset], content: [...] }
 *
 * Exposes CSS variables that components reference, so consumers can override
 * tokens without recompiling. Light/dark variants ship by default.
 */

/** @type {import("tailwindcss").Config} */
const preset = {
  theme: {
    extend: {
      colors: {
        btc: {
          DEFAULT: "hsl(var(--btc) / <alpha-value>)",
          orange: "hsl(var(--btc-orange) / <alpha-value>)",
        },
        ln: {
          DEFAULT: "hsl(var(--btc-lightning) / <alpha-value>)",
        },
        fee: {
          low: "hsl(var(--btc-fee-low) / <alpha-value>)",
          medium: "hsl(var(--btc-fee-medium) / <alpha-value>)",
          high: "hsl(var(--btc-fee-high) / <alpha-value>)",
        },
        network: {
          mainnet: "hsl(var(--btc-network-mainnet) / <alpha-value>)",
          testnet: "hsl(var(--btc-network-testnet) / <alpha-value>)",
          signet: "hsl(var(--btc-network-signet) / <alpha-value>)",
          regtest: "hsl(var(--btc-network-regtest) / <alpha-value>)",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
}

export default preset
