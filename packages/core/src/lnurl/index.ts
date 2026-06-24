/**
 * LNURL-pay / withdraw / auth helpers.
 *
 * Status: Phase 0 — stub.
 */
import type { Amount } from "../units/index.js"

export type LnurlKind = "pay" | "withdraw" | "auth"

export interface LnurlPayParams {
  readonly kind: "pay"
  readonly callback: string
  readonly minSendable: Amount
  readonly maxSendable: Amount
  readonly metadata: string
}

export interface LnurlWithdrawParams {
  readonly kind: "withdraw"
  readonly callback: string
  readonly k1: string
  readonly minWithdrawable: Amount
  readonly maxWithdrawable: Amount
  readonly defaultDescription: string
}

export type LnurlParams = LnurlPayParams | LnurlWithdrawParams

/** Resolve a Lightning Address (`user@domain`) to its LNURL-pay params. */
export async function resolveLightningAddress(_address: string): Promise<LnurlPayParams> {
  throw new Error("TODO(phase-0): implement resolveLightningAddress")
}

/** Decode a bech32-encoded LNURL string. */
export function decodeLnurl(_bech32: string): string {
  throw new Error("TODO(phase-0): implement decodeLnurl")
}
