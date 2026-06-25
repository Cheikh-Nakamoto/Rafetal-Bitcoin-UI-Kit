/**
 * @btc-ui/core
 *
 * Framework-agnostic TypeScript primitives for Bitcoin UIs.
 * Prefer importing from subpaths (e.g. `@btc-ui/core/units`) for optimal
 * tree-shaking. The barrel below is a convenience for prototyping.
 */
export * from "./units/index.js"
export * from "./format/index.js"
export * from "./address/index.js"
export * from "./bolt11/index.js"
// bip21 / bip39 are namespaced here to avoid barrel collisions on generic
// names (`encode`, `ParseResult`, `ValidateResult`). Their subpaths keep the
// flat API: `import { encode } from "@btc-ui/core/bip21"`.
export * as bip21 from "./bip21/index.js"
export * as bip39 from "./bip39/index.js"
export * from "./fees/index.js"
export * from "./mempool/index.js"
export * from "./price/index.js"
export * from "./wallet/index.js"
export * from "./lnurl/index.js"
export * from "./nostr/index.js"
export * from "./qr/index.js"
// psbt is intentionally not re-exported from the barrel — it pulls a large
// crypto dependency. Import explicitly from `@btc-ui/core/psbt`.
