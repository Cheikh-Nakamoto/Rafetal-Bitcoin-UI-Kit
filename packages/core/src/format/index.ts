/**
 * Locale-aware formatters for Bitcoin amounts and metadata.
 *
 * Status: Phase 0 — stub.
 */
import type { Amount, Unit } from "../units/index.js"

export interface FormatOptions {
  /** Output unit. */
  unit: Unit
  /** BCP-47 locale. Defaults to "en-US". */
  locale?: string
  /** Number of decimals to display. Default depends on unit. */
  decimals?: number
  /** Use grouping separators (e.g. `1,234,567`). Default true. */
  grouping?: boolean
}

export function formatAmount(_amount: Amount, _options: FormatOptions): string {
  throw new Error("TODO(phase-0): implement formatAmount")
}

export function formatAddress(_address: string, _truncate?: "middle" | "tail" | false): string {
  throw new Error("TODO(phase-0): implement formatAddress")
}

export function formatTxid(_txid: string, _truncate?: "middle" | "tail" | false): string {
  throw new Error("TODO(phase-0): implement formatTxid")
}
