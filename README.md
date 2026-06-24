<div align="center">

# frameworkBTC

**The ShadCN of Bitcoin.**

A copy-paste registry of accessible, unstyled, framework-agnostic UI components
for building Bitcoin and Lightning apps — on-chain, off-chain, and everything in between.

[Documentation](https://btc-ui.dev) · [Components](https://btc-ui.dev/components) · [Roadmap](./todo.md) · [Contributing](./CONTRIBUTING.md)

</div>

---

## Why this exists

Every new Bitcoin app starts the same way: building a balance display, an address formatter, a block clock, a fee selector, a seed phrase input — from scratch. ShadCN solved this problem for general web UI. [Bitcoin UI Kit](https://www.bitcoin-ui-kit.com) is the closest precedent for Bitcoin, but coverage is narrow and there's no community directory.

**frameworkBTC builds the next layer.** Copy-paste components you own. No npm runtime lock-in for the visual layer. Bitcoin-native concerns (BigInt sat math, network awareness, wallet protocols, hardware wallet flows) baked into the core.

## How it's different

- **Dual distribution.** A ShadCN-style CLI (`npx bitcoin-ui add balance`) for visual components — you own the code, you can audit and adapt it. Plus npm packages (`@btc-ui/core`, `@btc-ui/react`) for shared logic that doesn't make sense to copy-paste (validation, conversion, BOLT11 decode).
- **Headless first.** Components ship as Radix-style compound primitives with `asChild`, slots, and render-props. A Tailwind reference implementation is provided as the default style, but you can use any design system — shadcn/ui, Material, your own.
- **Framework-agnostic core.** Business logic lives in `@btc-ui/core` (TypeScript only). React adapters come first; Vue and Svelte adapters are planned without rewriting the logic layer.
- **Bitcoin-native by default.** BigInt sat math (never floats). Network-aware validation (mainnet, testnet, signet, regtest). WebLN / NWC / BitcoinConnect provider abstraction. Zero analytics, zero telemetry.

## Quick start

```bash
# in your existing Next.js / Vite / Remix project
npx bitcoin-ui@latest init
npx bitcoin-ui@latest add balance
```

```tsx
import { Balance } from "@/components/btc-ui/balance"

export default function Wallet() {
  return <Balance value={50_000n} unit="sat" />
}
```

## Workspace layout

```
apps/
├── registry/          # btc-ui.dev — docs site + component registry (Next.js + Fumadocs)
└── playground/        # Storybook (internal — Chromatic visual regression)

packages/
├── core/              # @btc-ui/core            framework-agnostic TS logic
├── react/             # @btc-ui/react           headless React primitives + hooks
├── react-tailwind/    # @btc-ui/react-tailwind  Tailwind reference implementation
├── cli/               # @btc-ui/cli             the `bitcoin-ui` CLI binary
├── icons/             # @btc-ui/icons           SVG icon set
├── tailwind-preset/   # @btc-ui/tailwind-preset design tokens preset
└── tsconfig/          # shared TS configs (internal)

docs/articles/         # Medium articles drafts
```

## Development

```bash
pnpm install
pnpm dev              # registry site + storybook in parallel
pnpm build            # build all packages
pnpm test             # run vitest across the workspace
pnpm lint             # biome lint + format check
pnpm typecheck        # tsc --noEmit across the workspace
pnpm changeset        # create a changeset for your PR
```

Node 20+ and pnpm 9+ required.

## Roadmap

See [todo.md](./todo.md) for the full component inventory (38 atomic components + 15 composed blocks + 20 hooks ≈ 73 units) and phase breakdown:

| Phase | Focus | Status |
|---|---|---|
| 0 | Scaffolding + `@btc-ui/core` math | in progress |
| 1 | Display MVP (Balance, Address, BlockHeight, …) | not started |
| 2 | Input components (AddressInput, AmountInput, …) | not started |
| 3 | Wallet connectors (WebLN, NWC, BitcoinConnect) | not started |
| 4 | Composed flows (SendForm, ReceiveScreen, …) + data viz | not started |
| 5 | Education, advanced, community RFC process | not started |

## Contributing

We want this to be community-driven. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution flow and RFC process.

## License

MIT — see [LICENSE](./LICENSE).
