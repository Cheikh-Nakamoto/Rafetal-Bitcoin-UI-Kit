/**
 * Fee estimators and sat/vB helpers.
 *
 * Status: Phase 0 — stub.
 */
import type { Amount } from "../units/index.js"

export type FeeTier = "no-priority" | "low" | "medium" | "high" | "fastest"

export interface FeeEstimates {
  readonly fastestFee: number // sat/vB
  readonly halfHourFee: number
  readonly hourFee: number
  readonly economyFee: number
  readonly minimumFee: number
}

export function pickFee(estimates: FeeEstimates, _tier: FeeTier): number {
  throw new Error("TODO(phase-0): implement pickFee")
}

export function estimateTxFee(_vsize: number, _satPerVb: number): Amount {
  throw new Error("TODO(phase-0): implement estimateTxFee")
}
