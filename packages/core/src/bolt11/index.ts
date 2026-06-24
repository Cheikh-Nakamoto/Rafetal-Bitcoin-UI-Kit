/**
 * BOLT11 (Lightning invoice) decoder.
 *
 * Errors are returned as data — never thrown. Heavy crypto deps are loaded
 * via dynamic import so consumers only pay the cost when they decode.
 *
 * Status: Phase 0 — stub.
 */
import type { Amount } from "../units/index.js"
import type { Network } from "../address/index.js"

export interface DecodedInvoice {
  readonly network: Network
  readonly amount: Amount | null
  readonly description: string | null
  readonly paymentHash: string
  readonly expiresAt: Date
  readonly payee: string | null
  readonly routeHints: readonly unknown[]
}

export type DecodeResult =
  | { ok: true; invoice: DecodedInvoice }
  | { ok: false; reason: "invalid-checksum" | "invalid-format" | "unknown-prefix" }

export async function decodeInvoice(_bolt11: string): Promise<DecodeResult> {
  throw new Error("TODO(phase-0): implement decodeInvoice")
}
