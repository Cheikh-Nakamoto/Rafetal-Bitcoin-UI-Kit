/**
 * PSBT helpers — wraps `bitcoinjs-lib`.
 *
 * Intentionally kept out of the main barrel because `bitcoinjs-lib` is heavy.
 * Import explicitly from `@btc-ui/core/psbt`.
 *
 * Status: Phase 0 — stub.
 */
import type { Amount } from "../units/index.js"

export interface PsbtInput {
  readonly txid: string
  readonly vout: number
  readonly value: Amount
}

export interface PsbtOutput {
  readonly address: string
  readonly value: Amount
}

export interface DecodedPsbt {
  readonly inputs: readonly PsbtInput[]
  readonly outputs: readonly PsbtOutput[]
  readonly fee: Amount
  readonly weight: number
}

export type DecodeResult =
  | { ok: true; psbt: DecodedPsbt }
  | { ok: false; reason: "invalid-base64" | "invalid-format" | "unsupported-version" }

export async function decodePsbt(_base64: string): Promise<DecodeResult> {
  throw new Error("TODO(phase-0): implement decodePsbt")
}
