/**
 * @btc-ui/react — headless React primitives + hooks for Bitcoin UIs.
 *
 * Components are compound (Radix-style) with `asChild` and render-prop slots.
 * Hooks are thin shells over `@btc-ui/core` — bring your own cache layer
 * (SWR, TanStack Query). They return `{ data, error, isLoading }` so they
 * compose naturally with either.
 */
export * from "./hooks/index.js"
export * from "./primitives/index.js"
