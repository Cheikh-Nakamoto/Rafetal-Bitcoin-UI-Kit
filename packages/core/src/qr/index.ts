/**
 * Framework-agnostic QR encoding.
 *
 * Returns a 2D bit matrix; rendering to SVG/Canvas lives in the framework
 * adapters (`@btc-ui/react`, etc.) so this stays UI-free.
 *
 * Status: Phase 0 — stub.
 */

export type ErrorCorrection = "L" | "M" | "Q" | "H"

export interface QrMatrix {
  readonly size: number
  /** Row-major boolean matrix. `true` = dark module. */
  readonly modules: ReadonlyArray<ReadonlyArray<boolean>>
}

export interface EncodeOptions {
  errorCorrection?: ErrorCorrection
  margin?: number
}

export function encode(_data: string, _options?: EncodeOptions): QrMatrix {
  throw new Error("TODO(phase-0): implement encode")
}
