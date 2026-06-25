# Building Rafetal: Headless Components for Bitcoin

*How we built a ShadCN-style component registry that refuses to lose a satoshi.*

---

[Article 1](./01-why-bitcoin-needs-shadcn.md) made the case: Bitcoin's UX is a coordination problem, and a ShadCN-shaped component registry — copy-paste UI, owned by the consumer — is the right tool to fix it. This article is the engineering follow-up. It is for the developer who skimmed Article 1, nodded, and asked: *fine, but how do you actually build this without it collapsing under the weight of bech32m, BIP39, BOLT11, three wallet protocols, four networks, and an open-source maintenance burden?*

What follows is the architecture we landed on, the deliberate trade-offs, and the parts that are different from a "normal" component library because Bitcoin makes them different.

## Architecture in one diagram

```
Rafetal-Bitcoin-UI-Kit/
├── apps/
│   ├── registry/             # btc-ui.dev — Next.js 15 + Fumadocs
│   │   ├── registry/         # source-of-truth components (copy-paste)
│   │   └── public/r/*.json   # built manifests served to the CLI
│   └── playground/           # Storybook 8 — Chromatic visual diffs
└── packages/
    ├── core/                 # @btc-ui/core — TS, framework-agnostic
    ├── react/                # @btc-ui/react — headless primitives + hooks
    ├── react-tailwind/       # @btc-ui/react-tailwind — reference styling
    ├── cli/                  # @btc-ui/cli — published as `bitcoin-ui`
    ├── icons/                # @btc-ui/icons — BTC / LN / hardware
    ├── tailwind-preset/      # @btc-ui/tailwind-preset — design tokens
    └── tsconfig/             # shared tsconfigs
```

**Why pnpm 9 + Turborepo.** pnpm's strict `node_modules` is the only package manager I trust in a monorepo where several packages share peer dependencies on React. The `workspace:*` protocol is the cleanest way to wire internal cross-deps without symlink gymnastics. Turborepo gives us remote caching that pays for itself the first time CI runs on a PR that only touches docs. Both are what shadcn-ui and Radix use; the path is well-trodden.

**Why Biome over ESLint + Prettier.** A single binary, zero config, formats and lints in one pass, written in Rust. The combined `eslint + prettier + eslint-config-prettier + eslint-plugin-react-hooks` stack is a maintenance burden I'd rather not own in a library that aspires to last. Where Biome falls short (today, `react-hooks/exhaustive-deps` parity is the obvious gap), we fall back to ESLint surgically.

**Why Changesets.** Every PR that changes a package ships its own changelog entry. The release workflow opens a "Version Packages" PR; merging it cuts the npm release and writes the GitHub release notes. The contributor never touches `npm version` and the maintainer never plays "which package changed since the last tag" detective.

## Three layers, one job each

Rafetal is structured as three vertically stacked layers:

```
┌──────────────────────────────────────────────────┐
│ Registry (apps/registry/registry/*)              │
│   Tailwind-styled, copy-paste, lives in YOUR repo│
├──────────────────────────────────────────────────┤
│ @btc-ui/react                                    │
│   Headless primitives + hooks                    │
│   Compound APIs, asChild, render-props           │
├──────────────────────────────────────────────────┤
│ @btc-ui/core                                     │
│   Pure TS — math, validators, parsers, clients   │
│   Zero React, zero DOM                           │
└──────────────────────────────────────────────────┘
```

The layer boundary matters: a Vue or Svelte port (Phase 5) reuses 100% of `@btc-ui/core`, replaces only `@btc-ui/react` with its own primitives, and re-publishes a different set of registry files. The framework choice doesn't leak into the math.

The registry layer is special. It is **not a published npm package**. It is a directory of `.tsx` files that the CLI copies, rewrites, and pastes into the consumer's repo — exactly like shadcn-ui. The consumer owns the source from the moment it lands. Forking is not a fork; it's just editing your own file.

## BigInt sat math, or: how to not lose people's money

The single most important invariant in this codebase: **no `number` ever touches an amount**. The reasons are well-known but worth repeating:

```ts
0.1 + 0.2                          // 0.30000000000000004
21_000_000 * 100_000_000           // OK today, breaks at 2^53 - 1
Math.round(0.1 + 0.2)              // round-to-half-even gotchas
1234.567 / 1000                    // floats can't represent 1/1000 exactly
```

Bitcoin's max supply is 2.1 × 10^15 sats — under the 2^53 ceiling, but only barely. Add millisatoshi precision for Lightning and you blow through it. So the only safe internal representation is `bigint`, and the only safe denomination is the smallest unit we care about (msat):

```ts
// packages/core/src/units/index.ts
export const SATS_PER_BTC = 100_000_000n
export const MSATS_PER_SAT = 1_000n

export type Unit = "btc" | "sat" | "msat"

export interface Amount {
  readonly msat: bigint
}

export function fromSat(sat: bigint): Amount
export function fromMsat(msat: bigint): Amount
export function fromBtcString(btc: string): Amount   // accepts "0.001234", never a number
export function toSat(amount: Amount): bigint        // truncates msat remainder
export function toMsat(amount: Amount): bigint
export function toBtcString(amount: Amount): string
export function sum(amounts: readonly Amount[]): Amount
```

The `Amount` is a struct of one `bigint`. That's it. `msat` is the canonical unit because anything that handles Lightning has to deal with sub-sat precision, and silently rounding to sats in a generic `Amount` would lose data. Code that only cares about on-chain works in sats and uses `fromSat` / `toSat` at the boundaries. The truncation in `toSat` is intentional, named, and tested with vectors.

The two parsing functions exist for a reason: `fromBtcString` takes a `string`, never a `number`, because the moment you accept `number` you've put your user one bad input field away from a precision bug. Inputs come from text fields; pass the text directly. A Biome lint rule rejects `Amount.*number` in PRs.

Formatting is locale-aware (and locale-aware *correctly* — French uses `1 234,56789012`, US `1,234.56789012`) but lives in `@btc-ui/core/format`, separated from the math itself so that bundles that don't need `Intl.NumberFormat` don't pay for it.

## Address validation, four networks deep

Bitcoin doesn't have an address. It has five address types over four networks, with two encoding families:

| Type   | Encoding | Mainnet prefix | Testnet prefix | Signet prefix |
|--------|----------|----------------|----------------|---------------|
| P2PKH  | base58   | `1`            | `m`/`n`        | `m`/`n`       |
| P2SH   | base58   | `3`            | `2`            | `2`           |
| P2WPKH | bech32   | `bc1q`         | `tb1q`         | `tb1q`        |
| P2WSH  | bech32   | `bc1q`         | `tb1q`         | `tb1q`        |
| P2TR   | bech32m  | `bc1p`         | `tb1p`         | `tb1p`        |

The frontend lesson: a "valid address" is meaningless without a network. Most existing libraries cheerfully accept a testnet address into a mainnet flow because validation is implicitly `mainnet`. Ours is not:

```ts
// packages/core/src/address/index.ts
export type Network = "mainnet" | "testnet" | "signet" | "regtest"
export type AddressType = "p2pkh" | "p2sh" | "p2wpkh" | "p2wsh" | "p2tr"

export interface AddressInfo {
  readonly type: AddressType
  readonly network: Network
  readonly bech32: boolean
}

export type ValidateResult =
  | { ok: true; info: AddressInfo }
  | { ok: false; reason: "invalid-format" | "wrong-network" | "unsupported-version" }

export function validateAddress(address: string, expected: Network): ValidateResult
export function detectNetwork(address: string): Network | null
```

Two things to notice. First, `expected` is mandatory — you cannot validate an address without declaring the network you wanted. Second, errors are data. There is no `throw`. A bad address from a paste handler is a normal user event, not an exception.

Codec loading is feature-detected at runtime. If your app only handles bech32, the base58 codec is dynamically imported on demand and tree-shaken when unused. You don't pay for P2TR validation in a Lightning-only tipping plugin.

## BOLT11 without the 200 kB bundle

A BOLT11 invoice is a bech32-encoded blob with a tagged TLV payload and a signature. Most existing decoders pull in `bitcoinjs-lib` (or its transitive secp256k1 binding) just to verify the signature, dragging ~200 kB of cryptography into your bundle for a parse you only needed for display.

We split the operations:

```ts
import { decodeInvoice } from "@btc-ui/core/bolt11"
const invoice = decodeInvoice("lnbc1...")        // ~12 kB — bech32 + TLV walk only

import { verifyInvoice } from "@btc-ui/core/bolt11/verify"
const ok = await verifyInvoice(invoice)          // dynamic-imports secp256k1
```

`decodeInvoice` returns `{ amountMsat, paymentHash, description, expiresAt, ... }` and is enough to render a payment-request screen, show a countdown, or warn the user the invoice has expired. Signature verification is opt-in and async, behind a separate subpath so tree-shakers can see it's not needed for read-only flows. The same trick covers PSBT parsing vs PSBT signing.

## Wallet abstraction: one provider over three protocols

WebLN was first. NWC (Nostr Wallet Connect, NIP-47) came second and is winning on mobile. BitcoinConnect wraps both with a UI. Every Bitcoin app today re-implements detection, fallbacks, and capability shimming. We don't:

```ts
// packages/core/src/wallet/index.ts
export type ProviderKind = "webln" | "nwc" | "bitcoin-connect" | "custom"

export interface WalletCapabilities {
  readonly canMakeInvoice: boolean
  readonly canPayInvoice: boolean
  readonly canSignMessage: boolean
  readonly canGetBalance: boolean
  readonly canKeysend: boolean
}

export interface WalletProvider {
  readonly kind: ProviderKind
  readonly name: string
  readonly capabilities: WalletCapabilities

  connect(): Promise<void>
  disconnect(): Promise<void>
  getBalance?(): Promise<Amount>
  makeInvoice?(opts: { amount: Amount; memo?: string }): Promise<string>
  payInvoice?(bolt11: string): Promise<{ preimage: string }>
  signMessage?(message: string): Promise<{ signature: string; address: string }>
}

export function detectProviders(): readonly WalletProvider[]
```

Capability discovery means an app branches on a boolean, not on a `try/catch` around a feature probe:

```tsx
{wallet.capabilities.canKeysend
  ? <KeysendForm wallet={wallet} />
  : <InvoiceFallback wallet={wallet} />}
```

Methods that depend on a capability are marked optional in the type itself. If `canMakeInvoice` is `false`, `makeInvoice` is `undefined` and TypeScript will not let you call it. This is the kind of invariant that's worth a thousand runtime checks.

## The headless pattern, in practice

The clearest illustration is `<AmountInput>`. Naively, an amount input is a `<input type="text" />` with regex. In reality, it has to: switch units, show a fiat preview, max-out from a balance, accept paste with grouping characters, defeat IME composition, never throw on partial input, and never lose precision. Here is the compound API:

```tsx
<AmountInput.Root
  value={amount}                        // Amount | undefined
  onValueChange={setAmount}
  unit="sat"
  onUnitChange={setUnit}
  network="mainnet"
>
  <AmountInput.Field placeholder="0" />
  <AmountInput.UnitSwitch />
  <AmountInput.MaxButton from={walletBalance} />
  <AmountInput.FiatPreview>
    {(fiat) => <span className="text-muted">≈ {fiat}</span>}
  </AmountInput.FiatPreview>
</AmountInput.Root>
```

The pattern is Radix-style: `Root` is the controller, child slots subscribe via context, `asChild` exists everywhere a structural element does. State is BigInt-safe end to end — the Field component holds the *string* the user is typing (so partial input like `"0."` is preserved), and only commits an `Amount` on every parse-success. The `FiatPreview` is a render-prop because every project's fiat formatting (decimals, symbol position, hedging caveats) is different, and we have no business hard-coding ours.

The Tailwind reference implementation, which is what `bitcoin-ui add amount-input` actually drops into your repo, is a *consumer* of these primitives. You can fork it, paste it into a Chakra app, throw away the Tailwind classes, keep the logic. The contract is the primitive, not the look.

## Registry CLI mechanics

`bitcoin-ui add balance` is a deceptively short command. What happens:

1. Read `components.json` from cwd (written by `bitcoin-ui init`). It declares the consumer's aliases (`@/components`, `@/hooks`, `@/lib`), the chosen style (`default | headless`), the target network, the icon library, the Tailwind preset path.
2. Fetch `https://btc-ui.dev/r/balance.json`. The manifest declares `dependencies` (npm packages) and `registryDependencies` (other registry items).
3. Recursively resolve the dep graph. Detect cycles. Deduplicate. Build a topologically-sorted install plan.
4. For each item, compute the destination path using the consumer's aliases. Rewrite imports in the file's source so `@/components/btc-ui/...` matches their convention.
5. Inject Tailwind config additions and CSS variables idempotently. We never overwrite an existing override; we merge, and only write if the merge produced a change.
6. Detect the package manager via lockfile. Run `pnpm add` / `npm add` / `yarn add` / `bun add` for npm deps.
7. Write the files with an overwrite prompt unless `--yes` or `--overwrite`. Show a diff summary and a "Next steps" block on success.

The most important command is the one nobody talks about: `bitcoin-ui diff`. Since the consumer owns the source, they will edit it. They will also forget what they edited. `diff` compares their local copy against the registry's current canonical version, with a unified-diff view, so they can see what's been customized and what's drifted. ShadCN has the same command for the same reason.

## Testing strategy

| Layer | Tool | What it proves |
|---|---|---|
| `@btc-ui/core` math | **Vitest** with BIP test vectors | round-trip BTC↔sat↔msat, parsing edge cases, locale formatting, overflow |
| `@btc-ui/core` codecs | **Vitest** with bech32/bech32m test vectors from the BIPs | correct rejection of mainnet addresses in testnet flows, P2TR acceptance |
| `@btc-ui/cli` | **Playwright** in a tmp directory | `init` then `add balance` produces a buildable Next.js app |
| Visual regression | **Chromatic** via Storybook | every variant, every size, every theme, on every PR |
| Bundle | **size-limit** | hard caps per entrypoint, CI fails on regression |

Vitest's workspace mode lets one config cover every package. Playwright runs the CLI against a real `pnpm create next-app` scratch directory and asserts the diff. Chromatic catches the kind of "I refactored a CSS variable" bug that no unit test can.

## Bundle hygiene

The default rule: a consumer who only renders a `Balance` should not pay for the BOLT11 decoder. We enforce this with:

- **ESM-only.** No CJS, no UMD, no default exports. Every named export is tree-shakeable.
- **`sideEffects: false`** in every package.json that can declare it.
- **15 subpath exports** in `@btc-ui/core`. `import "@btc-ui/core/units"` doesn't load `bolt11` or `psbt`.
- **Dynamic imports for heavy paths.** Signature verification, full PSBT signing, QR camera primitives — all behind `await import(...)`.
- **Peer dependencies for state.** SWR / TanStack Query are peers, not deps. Hooks return `{ data, error, isLoading }`; the consumer's cache stays the consumer's.

The result is a per-entrypoint cost the consumer can audit. The CI build prints a table; reviewers see deltas; "this PR added 4 kB to the Balance entrypoint" is a conversation we can have.

## What we kept from Radix, and where Bitcoin pulled us away

We kept: `asChild`, controlled/uncontrolled state, compound APIs, Radix's accessibility primitives (focus management, ARIA, keyboard nav). All of it transfers cleanly.

Where Bitcoin pulled us away:

- **Unit conversion is shared state.** A wallet screen with a `Balance`, an `AmountInput`, and a `FiatAmount` should all switch units together when the user toggles sat/BTC. Radix doesn't ship a primitive for "shared toggle across siblings" because most apps don't need one. We do, so we ship a `UnitProvider` context.
- **Network is global.** Validators, formatters, explorer links — they all need the network. A `<NetworkProvider value="signet">` wraps the tree; every primitive reads from it; switching network in the provider re-validates downstream components. This is heavier than a typical theme provider.
- **Errors are data, not exceptions.** A `<input>` whose paste handler `throw`s on a bad invoice is a hostile UX. Every parser in `@btc-ui/core` returns `{ ok: true, value } | { ok: false, reason }`. Exceptions are reserved for true bugs.

## Where we go from here

The roadmap is public. Phase 0 (this scaffold) is done. Phase 1 ships the eight display components and four hooks that turn the registry from a skeleton into something a wallet team can adopt. The full catalog is **38 atomic components, 15 composed blocks, and 20 hooks — about 73 units**. Each is a self-contained PR.

Open questions, in priority order:

- **When do we cut a Vue adapter?** The core is framework-agnostic by design, but a published Vue layer needs a maintainer who lives in Vue. The bet is that Phase 4 demand pulls one in.
- **On-chain wallet provider standardization.** WebLN/NWC/BitcoinConnect cover Lightning. There is no equivalent for on-chain (PSBT signing, address generation). Do we propose one, or do we wait?
- **Paid components.** A `SwapInterface` integrating a specific liquidity provider is more vendor-specific than the rest of the catalog. We're undecided whether those belong in the open registry, in a separate paid registry, or in vendor-maintained repos consumed via custom registry URLs.

If you want to weigh in on any of these, the RFC process lives in `/rfcs` in the repo. PRs welcome. Star the [repo](https://github.com/Cheikh-Nakamoto/Rafetal-Bitcoin-UI-Kit) — it remains the single most useful thing a reader can do for the project today.

Bitcoin's UX is a coordination problem. We're building the coordination tool.

---

*Rafetal Bitcoin UI Kit is MIT-licensed. The code lives at [github.com/Cheikh-Nakamoto/Rafetal-Bitcoin-UI-Kit](https://github.com/Cheikh-Nakamoto/Rafetal-Bitcoin-UI-Kit). The docs and component catalog live at [btc-ui.dev](https://btc-ui.dev).*

*Catch up on [Article 1: Why Bitcoin Needs Its Own ShadCN](./01-why-bitcoin-needs-shadcn.md) for the vision and motivation behind the project.*
