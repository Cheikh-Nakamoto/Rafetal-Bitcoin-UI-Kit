# Why Bitcoin Needs Its Own ShadCN

*The frontend layer of the Bitcoin ecosystem is duct tape. Here's how we fix it.*

---

I have seen the same "send" screen ten times this year. Ten different Bitcoin apps. Ten developers who each spent an afternoon writing the same address validator, the same sat/BTC toggle, the same QR code generator, the same fee selector. Two of those ten apps quietly used JavaScript `Number` for satoshi math — which is to say, two of those ten apps could silently lose your funds at scale.

This is not because Bitcoin developers are bad. It is because the frontend layer of Bitcoin is duct tape. There is no shared UI vocabulary, no agreed-upon primitive, no community catalog you can pull from. So every team rebuilds from scratch — and every team rebuilds *the same bugs* from scratch.

The fix is borrowed from the React world, and it is sitting in plain sight: **ShadCN for Bitcoin**.

## The thing we copy

If you've shipped a React app in the last two years, you've used or considered [shadcn/ui](https://ui.shadcn.com). The trick is deceptively simple: it isn't a package. It's a *registry*. You run a CLI:

```bash
npx shadcn@latest add button
```

…and the source code of the Button is copied into your repo. You own it. You audit it. You restyle it. You delete the parts you don't need. There is no `node_modules/shadcn/Button.js` to fight with, no peer dependency resolution, no upgrade dance.

This model works because *components are not libraries*. A button is a small, opinionated piece of code. You should be able to read it, edit it, and ship it without asking anyone's permission. ShadCN treats components like recipes: here's a good one, paste it in, season to taste.

Bitcoin needs the same thing. Not Bitcoin-themed buttons — Bitcoin-native primitives. The kind that know that a satoshi is a `bigint`, that a Lightning invoice expires, that a P2TR address is valid on testnet but not mainnet, that a fee rate is in sat/vB and rounds *up*. The kind that bake those facts into the type system so the next junior dev cannot accidentally rebuild the bug.

## What's missing today

There are good projects in this space already. [Bitcoin UI Kit](https://www.bitcoin-ui-kit.com) ships React components for things like `PasswordInput`, `CurrencyInput`, `QRCode`. [BitcoinConnect](https://bitcoin-connect.com) standardizes the wallet-connection flow. Individual wallet teams (Alby, Mutiny, Phoenix, Breez) build excellent in-house components.

What's missing:

- **A community catalog.** There is no `ui.shadcn.com` for Bitcoin. No place where a dev can browse 50 components, preview them, copy one, and ship.
- **A consistent BigInt-safe core.** Most existing libraries cheerfully accept `number` for amounts. This is a footgun the Bitcoin space cannot afford.
- **Headless primitives.** Components today come pre-styled — usually in someone else's brand. Adapting them to a new design system means rewriting them.
- **Multi-protocol wallet abstraction.** WebLN, NWC (Nostr Wallet Connect), BitcoinConnect — three increasingly-important protocols, each implemented from scratch in every app.
- **First-class network awareness.** Mainnet, testnet, signet, regtest — validation and formatting must accept all four. Most libraries silently assume mainnet.

## Introducing frameworkBTC

[frameworkBTC](https://btc-ui.dev) is a community-driven catalog of UI components for Bitcoin and Lightning apps, built on the ShadCN model.

**The pitch in one sentence.** Run `npx bitcoin-ui add balance` and a BigInt-safe, network-aware, accessible Balance component lands in your repo, written in whatever framework you use, ready to be styled in whatever design system you ship.

The model has two layers:

1. **A copy-paste registry** for the visual components (Balance, AddressInput, FeeSelector, SendForm, WalletConnector, …). You own the source. You can fork it, restyle it, audit it.
2. **A set of npm packages** for the parts that don't make sense to copy-paste: the BigInt sat math, the BOLT11 decoder, the address validator, the wallet provider abstraction. These are in `@btc-ui/core` and `@btc-ui/react`. They're tiny, ESM-only, tree-shakeable, and have zero telemetry.

The combination matters. ShadCN's pure-registry model is great for buttons but breaks down for cryptographic logic — you don't want every project to fork its own BOLT11 decoder. frameworkBTC keeps the *security-sensitive logic* in audited npm packages, and lets the *visual layer* live in your codebase, where you can shape it freely.

## What we mean by "headless first"

Bitcoin apps span an enormous design surface. Mutiny is a dark mobile wallet. Strike is a clean fintech UI. Sparrow is a desktop dev tool. A self-custody hardware-wallet companion looks nothing like a Lightning tipping plugin.

A single styled component cannot serve all of them. So frameworkBTC ships components in two flavors:

- **Headless primitives** (`@btc-ui/react/primitives`) — Radix-style compound components with `asChild`, slots, render-props. They handle the *logic* (state, validation, formatting, accessibility) and emit raw data. You bring the styles.
- **A Tailwind reference implementation** (`@btc-ui/react-tailwind`) — opinionated, themable via CSS variables. It is *the default style*, not *the only style*. You can copy it, fork it, replace it.

Think of the headless layer as the engine and the reference implementation as one body. If you drive a Strike-shaped car, you keep the engine and swap the body.

## Bitcoin-native by default

A few things frameworkBTC takes seriously, that off-the-shelf component libraries typically don't:

- **BigInt sat math.** Every amount in the API is a `bigint`. We refuse `number` at the type level. A custom lint rule catches accidental float arithmetic in PRs. This is not a stylistic choice — it is the difference between an app that loses money and one that doesn't.
- **Network awareness.** Every validator accepts a `network: "mainnet" | "testnet" | "signet" | "regtest"` parameter. You will not accidentally accept a testnet address into a mainnet flow.
- **Multi-protocol wallet abstraction.** A single `WalletProvider` interface over WebLN, NWC, and BitcoinConnect. Capability discovery (`canMakeInvoice`, `canSignMessage`) lets apps branch on what the connected wallet supports rather than try/catch around feature detection.
- **Hardware wallet flows treated as first-class.** SeedBackupWizard, HardwareWalletPrompt, PSBTInput (with file drop, QR animation, and clipboard paste in one component). These aren't afterthoughts.
- **Errors as data.** Bitcoin parsers don't throw. They return `{ ok: true, value }` or `{ ok: false, reason }`. Exceptions are reserved for true bugs, not user input.
- **Zero telemetry, zero analytics, zero remote calls** outside what the user explicitly opts into. This is non-negotiable. Self-custody users do not trust software that phones home, and they're right not to.

## What ships, and when

The catalog covers roughly **38 atomic components, 15 composed blocks, 20 hooks** — about 73 distinct units. Phased rollout:

| Phase | Focus |
|---|---|
| 0 | Monorepo scaffolding, core BigInt math, mempool client, registry CLI skeleton |
| 1 | Display MVP — Balance, Address, BlockHeight, FiatAmount, ConfirmationsBadge, ExchangeRate |
| 2 | Inputs — AddressInput, AmountInput, InvoiceInput, SeedPhraseInput, PasswordInput, ScanQR |
| 3 | Wallet connectors — WebLN, NWC, BitcoinConnect, plus all the action buttons |
| 4 | Composed flows — SendForm, ReceiveScreen, TransactionList, PaymentRequest — and data viz |
| 5 | Education, advanced (UTXOSelector, ChannelsList, SwapInterface), community RFC process |

The full inventory and variant strategy live in [`todo.md`](https://github.com/frameworkBTC/frameworkBTC/blob/main/todo.md) in the repo.

## Variants without the variant explosion

A common failure mode of component libraries is the variant explosion: `<Balance variant="compact" />`, `<Balance variant="expanded" />`, `<Balance variant="inline" />`, `<Balance variant="compact-with-fiat" />`, … until you have thirty props and a maintenance nightmare.

frameworkBTC sidesteps this by leaning on four patterns:

1. **Compound components.** `<Balance.Root>`, `<Balance.Value>`, `<Balance.Unit>`, `<Balance.Toggle>` — the user reorders, omits, or styles each slot independently.
2. **`asChild`.** Delegate the rendering to the user's design-system primitives. We keep the logic, they keep the look.
3. **Render props for data.** `<TransactionList>{tx => <MyRow tx={tx} />}</TransactionList>`. We fetch and virtualize; you render.
4. **CSS variables for theming.** No recompilation needed. Override `--btc-orange` and you've rebranded.

The result: **one implementation per component**. Two CVA variants at most (`size`, `tone`). Everything else is composition.

## A coordination problem

Bitcoin has a UX problem, but it's not really a design problem. It's a coordination problem.

Every team that has shipped a Bitcoin app has solved the same primitives, with the same bugs, in private. The work doesn't compound. A senior wallet engineer at one company solves sat/BTC rounding correctly; a junior engineer at another company solves it incorrectly six months later. The ecosystem does not learn.

ShadCN proved that a registry-shaped catalog *does* let work compound — because the unit of sharing is small (a single component), the unit of ownership is small (the user owns the file), and the unit of contribution is small (one PR adds one component to the registry).

frameworkBTC bets that the same shape works for Bitcoin — and that solving the UI layer once, in public, removes one of the biggest sources of friction in the ecosystem.

## How to help

- **Star [the repo](https://github.com/frameworkBTC/frameworkBTC).** It is more useful than you think — it tells maintainers and contributors the project is alive.
- **Open an issue** describing what your team has rebuilt three times. That's the signal for what belongs in the catalog.
- **Pick a component from [`todo.md`](https://github.com/frameworkBTC/frameworkBTC/blob/main/todo.md) and ship it.** Each one is a self-contained PR. Contribution guidelines are in [CONTRIBUTING.md](https://github.com/frameworkBTC/frameworkBTC/blob/main/CONTRIBUTING.md).
- **Run an RFC** if you want to propose a deeper change — a new wallet protocol, a new framework adapter, a new design token system.
- **Sponsor** if you ship a Bitcoin product and want this work to move faster. The roadmap is public; the line items are clear.

## What's next

This is Article 1 — the vision. Article 2 ([*"Building frameworkBTC: Headless Components for Bitcoin"*](#)) is the technical deep-dive: how we implement BigInt sat math without losing precision, how we decode BOLT11 without dragging 200kB of crypto into your bundle, how the registry CLI resolves a dependency graph and merges your Tailwind config idempotently, how a single `WalletProvider` interface unifies WebLN, NWC, and BitcoinConnect.

Bitcoin's UX problem is a coordination problem. Let's solve it once.

---

*frameworkBTC is MIT-licensed. The code lives at [github.com/frameworkBTC/frameworkBTC](https://github.com/frameworkBTC/frameworkBTC). The docs and component catalog live at [btc-ui.dev](https://btc-ui.dev).*

*If you build Bitcoin apps and want to chat about the roadmap, my inbox is open.*
