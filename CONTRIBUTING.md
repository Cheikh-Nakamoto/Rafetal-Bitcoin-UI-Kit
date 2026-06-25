# Contributing to Rafetal Bitcoin UI Kit

Thanks for being interested. Rafetal is meant to be a community-driven catalog — we want your PRs.

## Quick start

```bash
git clone https://github.com/<your-fork>/Rafetal-Bitcoin-UI-Kit.git
cd Rafetal-Bitcoin-UI-Kit
pnpm install
pnpm dev
```

You'll get the docs site (apps/registry) on `http://localhost:3000` and Storybook on `http://localhost:6006`.

## Project layout

See [README.md](./README.md#workspace-layout).

## Contributing a new component

There are 4 places to touch when adding a component (e.g., `BlockClock`):

1. **`packages/core/src/<module>/`** — pure TypeScript logic if relevant (no React).
2. **`packages/react/src/primitives/<component>.tsx`** — headless React primitive (compound + asChild + render-props).
3. **`apps/registry/registry/default/<component>.tsx`** — the Tailwind reference implementation that ships through the CLI.
4. **`apps/registry/content/components/<component>.mdx`** — documentation page (with `<ComponentPreview />`).

A component is "ready to ship" when:
- It has Vitest tests for the logic in `@btc-ui/core`.
- It has a Storybook story in `apps/playground`.
- It has an MDX docs page.
- All `pnpm lint typecheck test build` pass.
- A `changeset add` has been included in the PR.

## Coding rules

- **Never use `number` for satoshi math.** Always `bigint`. Floats lose precision. A unit test enforces this.
- **Never throw on invalid Bitcoin data.** Return `{ ok: false, error }` from core parsers (BOLT11, addresses, BIP21). Errors-as-data, not exceptions.
- **No telemetry, no analytics, no remote calls** outside what the user explicitly opts into. This is non-negotiable.
- **ESM-only.** No `module.exports`. `package.json` `type: "module"`.
- **No default exports.** Named exports only.
- **`peerDependencies` for React, SWR/TanStack Query, Tailwind.** We never bundle those.
- **Headless first, style last.** If the component can't be used without Tailwind, the headless layer is wrong.
- **Network-aware by default.** Validation and formatting must accept `network: "mainnet" | "testnet" | "signet" | "regtest"`.

## Commits & PRs

- Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(core/units): add msat helpers`, `fix(react/address): handle bech32m`, `docs(registry): add Balance page`.
- One feature or fix per PR.
- Run `pnpm changeset` and commit the generated file — this drives the changelog and version bumps.
- CI must be green.

## RFC process

For larger changes (new package, new wallet protocol, breaking API change), open an RFC first:

1. Copy `rfcs/template.md` to `rfcs/NNNN-short-name.md`.
2. Fill it in (motivation, design, alternatives, drawbacks).
3. Open a PR. Discussion happens in the PR.
4. RFC merges → implementation PR can land.

## Code of conduct

Be kind. Bitcoin is contentious; this project is not. Disagreements about technical direction happen in RFCs and PRs — not in personal attacks.

## Questions

Open a [Discussion](https://github.com/Cheikh-Nakamoto/Rafetal-Bitcoin-UI-Kit/discussions) or jump in our community channels (linked from the docs site).
