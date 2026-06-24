/**
 * Balance — Tailwind reference implementation.
 *
 * Copied verbatim into the user's project by `bitcoin-ui add balance`. After
 * copy, the user owns this file; edit freely.
 *
 * Status: Phase 0 — placeholder. Full implementation lands in Phase 1.
 */
"use client"

import type { ReactNode } from "react"

export interface BalanceProps {
  /** Amount in satoshis. BigInt only — no floats. */
  value: bigint
  /** Initial display unit. */
  unit?: "sat" | "btc" | "fiat"
  /** Fiat ISO code when unit is "fiat". */
  fiat?: string
  /** BCP-47 locale for formatting. */
  locale?: string
  /** Reference-impl size. */
  size?: "sm" | "md" | "lg"
  /** Extra class names. */
  className?: string
  children?: ReactNode
}

export function Balance(_props: BalanceProps) {
  return <span className="font-mono">TODO(phase-1): Balance</span>
}
