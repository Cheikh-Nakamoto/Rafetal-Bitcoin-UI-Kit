import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/units/index.ts",
    "src/format/index.ts",
    "src/address/index.ts",
    "src/bolt11/index.ts",
    "src/bip21/index.ts",
    "src/bip39/index.ts",
    "src/psbt/index.ts",
    "src/fees/index.ts",
    "src/mempool/index.ts",
    "src/price/index.ts",
    "src/wallet/index.ts",
    "src/lnurl/index.ts",
    "src/nostr/index.ts",
    "src/qr/index.ts",
  ],
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
})
