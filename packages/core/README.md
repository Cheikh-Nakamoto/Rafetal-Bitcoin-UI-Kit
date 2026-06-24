# @btc-ui/core

Framework-agnostic TypeScript primitives for Bitcoin UIs.

This package contains zero React (or any UI framework). It is the logic layer underneath `@btc-ui/react`, `@btc-ui/react-tailwind`, and any future Vue / Svelte adapters.

## Modules

| Module | Subpath | What |
|---|---|---|
| `units` | `@btc-ui/core/units` | sat / BTC / msat BigInt math |
| `format` | `@btc-ui/core/format` | locale-aware formatters |
| `address` | `@btc-ui/core/address` | network-aware address validation |
| `bolt11` | `@btc-ui/core/bolt11` | Lightning invoice decoding |
| `bip21` | `@btc-ui/core/bip21` | `bitcoin:` URI parsing/encoding |
| `bip39` | `@btc-ui/core/bip39` | mnemonic wordlist + checksum |
| `psbt` | `@btc-ui/core/psbt` | PSBT helpers (wraps `bitcoinjs-lib`) |
| `fees` | `@btc-ui/core/fees` | fee estimators, sat/vB conversions |
| `mempool` | `@btc-ui/core/mempool` | mempool.space client (REST + WS) |
| `price` | `@btc-ui/core/price` | exchange-rate aggregator interface |
| `wallet` | `@btc-ui/core/wallet` | WebLN / NWC / BitcoinConnect provider abstraction |
| `lnurl` | `@btc-ui/core/lnurl` | LNURL-pay / withdraw / auth |
| `nostr` | `@btc-ui/core/nostr` | NIP-47 (NWC) helpers |
| `qr` | `@btc-ui/core/qr` | framework-agnostic QR encoding |

## Status

All modules are skeletons in Phase 0. See [the project roadmap](../../README.md#roadmap).
