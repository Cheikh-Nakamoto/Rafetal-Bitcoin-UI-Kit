/**
 * BIP21 `bitcoin:` URI parsing and encoding.
 *
 * Example: `bitcoin:bc1q...?amount=0.001&label=Donation&lightning=lnbc...`
 *
 * Status: Phase 0 — stub.
 */
import type { Amount } from "../units/index.js"

export interface Bip21 {
  readonly address: string
  readonly amount: Amount | null
  readonly label: string | null
  readonly message: string | null
  readonly lightning: string | null
  readonly other: Readonly<Record<string, string>>
}

export type ParseResult = { ok: true; uri: Bip21 } | { ok: false; reason: "invalid-format" }

export function parse(_uri: string): ParseResult {
  throw new Error("TODO(phase-0): implement parse")
}

export function encode(_uri: Bip21): string {
  throw new Error("TODO(phase-0): implement encode")
}
