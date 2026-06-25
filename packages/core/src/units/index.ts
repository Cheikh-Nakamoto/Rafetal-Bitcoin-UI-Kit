/**
 * Sat / BTC / msat conversions using BigInt only.
 *
 * NEVER use `number` for satoshi math — floats lose precision and produce
 * silent fund-loss bugs (e.g. `0.1 + 0.2 !== 0.3`). All amounts internal to
 * Rafetal are `bigint` satoshis. Lightning amounts add a `msat` layer
 * (1 sat = 1000 msat) also represented as `bigint`.
 */

export const SATS_PER_BTC = 100_000_000n
export const MSATS_PER_SAT = 1_000n
export const MSATS_PER_BTC = SATS_PER_BTC * MSATS_PER_SAT

/** Number of decimal places in a BTC-denominated string. */
const BTC_DECIMALS = 8

export type Unit = "btc" | "sat" | "msat"

/**
 * Represents a Bitcoin amount internally as msat (smallest unit), so that
 * Lightning sub-sat precision is preserved without any further branching.
 */
export interface Amount {
  readonly msat: bigint
}

/**
 * Rounding mode used when converting msat → sat (or finer → coarser unit).
 *
 * - `trunc`  : drop the remainder (default — closest to "what you held").
 * - `floor`  : round toward −∞.
 * - `ceil`   : round toward +∞.
 * - `round`  : banker's rounding (half-to-even) — avoids cumulative drift.
 */
export type RoundingMode = "trunc" | "floor" | "ceil" | "round"

export interface ToSatOptions {
  readonly rounding?: RoundingMode
}

/**
 * Errors as data: parsing functions return a Result, never throw on user input.
 * Throwing is reserved for invariants that indicate a programming bug
 * (e.g. passing a non-bigint to `fromSat`).
 */
export type ParseResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: string }

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

/** Construct an Amount from an integer number of satoshis. */
export function fromSat(sat: bigint): Amount {
  if (typeof sat !== "bigint") {
    throw new TypeError(`fromSat expects bigint, received ${typeof sat}`)
  }
  return { msat: sat * MSATS_PER_SAT }
}

/** Construct an Amount from a millisatoshi count (Lightning). */
export function fromMsat(msat: bigint): Amount {
  if (typeof msat !== "bigint") {
    throw new TypeError(`fromMsat expects bigint, received ${typeof msat}`)
  }
  return { msat }
}

/**
 * Construct an Amount from a BTC-denominated decimal string ("0.001234").
 * Floats are intentionally not accepted — pass a string from your input field.
 *
 * Accepts an optional leading `-`, optional `+`, at most one `.`,
 * and up to 8 fractional digits (anything finer is precision the BTC unit
 * cannot represent — Lightning sub-sat precision lives in msat).
 *
 * Returns a {@link ParseResult} so invalid user input becomes data, not throws.
 */
export function fromBtcString(btc: string): ParseResult<Amount> {
  if (typeof btc !== "string") {
    return { ok: false, reason: "input must be a string" }
  }
  const trimmed = btc.trim()
  if (trimmed.length === 0) {
    return { ok: false, reason: "empty input" }
  }
  // Strict pattern: optional sign, digits, optional decimal + digits.
  const match = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(trimmed)
  if (!match) {
    return { ok: false, reason: `not a decimal: "${btc}"` }
  }
  const sign = match[1] === "-" ? -1n : 1n
  const whole = match[2] ?? ""
  const frac = match[3] ?? ""
  if (frac.length > BTC_DECIMALS) {
    return {
      ok: false,
      reason: `too many fractional digits (${frac.length} > ${BTC_DECIMALS}); use fromMsat for sub-sat precision`,
    }
  }
  const fracPadded = frac.padEnd(BTC_DECIMALS, "0")
  const sat = BigInt(whole) * SATS_PER_BTC + BigInt(fracPadded)
  return { ok: true, value: { msat: sign * sat * MSATS_PER_SAT } }
}

/**
 * Construct an Amount from a sat-denominated decimal string ("123456").
 * Returns a {@link ParseResult}.
 */
export function fromSatString(sat: string): ParseResult<Amount> {
  if (typeof sat !== "string") {
    return { ok: false, reason: "input must be a string" }
  }
  const trimmed = sat.trim()
  if (trimmed.length === 0) {
    return { ok: false, reason: "empty input" }
  }
  const match = /^([+-]?)(\d+)$/.exec(trimmed)
  if (!match) {
    return { ok: false, reason: `not an integer: "${sat}"` }
  }
  const sign = match[1] === "-" ? -1n : 1n
  return { ok: true, value: { msat: sign * BigInt(match[2] ?? "0") * MSATS_PER_SAT } }
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

/**
 * Convert an Amount to a satoshi integer.
 *
 * Default rounding is `trunc` (matches "what you actually hold in sats").
 * For Lightning fee accounting, prefer `floor` for credits and `ceil` for
 * debits to avoid undercharging.
 */
export function toSat(amount: Amount, options: ToSatOptions = {}): bigint {
  return divide(amount.msat, MSATS_PER_SAT, options.rounding ?? "trunc")
}

/** Convert an Amount to a millisatoshi integer. */
export function toMsat(amount: Amount): bigint {
  return amount.msat
}

/**
 * Convert an Amount to a decimal BTC string suitable for display.
 *
 * Output is always normalized: no thousand separators, no trailing zeros
 * beyond the requested precision, and a leading `-` for negative values.
 * Use the `format` module if you need locale-aware grouping.
 *
 * `decimals` controls how many fractional digits are emitted; the default
 * is 8 (the full satoshi precision). The msat remainder is dropped at the
 * requested precision according to `rounding` (default `trunc`).
 */
export function toBtcString(
  amount: Amount,
  options: { readonly decimals?: number; readonly rounding?: RoundingMode } = {},
): string {
  const decimals = options.decimals ?? BTC_DECIMALS
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > BTC_DECIMALS) {
    throw new RangeError(`decimals must be an integer in [0, ${BTC_DECIMALS}]`)
  }
  const rounding = options.rounding ?? "trunc"

  // Scale from msat to "10^decimals units of BTC".
  // msat per BTC = 10^11. We want value at 10^decimals → divide by 10^(11-decimals).
  const scale = 10n ** BigInt(BTC_DECIMALS + 3 - decimals)
  const scaled = divide(amount.msat, scale, rounding)

  const negative = scaled < 0n
  const abs = negative ? -scaled : scaled
  if (decimals === 0) {
    return `${negative ? "-" : ""}${abs.toString()}`
  }
  const padded = abs.toString().padStart(decimals + 1, "0")
  const whole = padded.slice(0, padded.length - decimals)
  const frac = padded.slice(padded.length - decimals)
  return `${negative ? "-" : ""}${whole}.${frac}`
}

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

/** Sum a list of amounts. Returns an Amount of 0 msat for an empty list. */
export function sum(amounts: readonly Amount[]): Amount {
  let total = 0n
  for (const a of amounts) total += a.msat
  return { msat: total }
}

/** Add two amounts. */
export function add(a: Amount, b: Amount): Amount {
  return { msat: a.msat + b.msat }
}

/** Subtract `b` from `a`. */
export function subtract(a: Amount, b: Amount): Amount {
  return { msat: a.msat - b.msat }
}

/**
 * Multiply an amount by an integer factor.
 *
 * Intentionally refuses non-bigint factors: percentage or fractional scaling
 * must be expressed via integer numerator/denominator with `scale()` to keep
 * the result deterministic.
 */
export function multiply(a: Amount, factor: bigint): Amount {
  if (typeof factor !== "bigint") {
    throw new TypeError("multiply expects a bigint factor; use scale() for ratios")
  }
  return { msat: a.msat * factor }
}

/**
 * Scale an amount by a rational ratio `num / den`.
 *
 * Both `num` and `den` are bigints, which makes the operation exact and
 * deterministic. The result is rounded according to `rounding` (default `trunc`).
 */
export function scale(
  a: Amount,
  num: bigint,
  den: bigint,
  rounding: RoundingMode = "trunc",
): Amount {
  if (den === 0n) {
    throw new RangeError("scale: denominator must be non-zero")
  }
  return { msat: divide(a.msat * num, den, rounding) }
}

/** Compare two amounts. Returns -1, 0, or 1. */
export function compare(a: Amount, b: Amount): -1 | 0 | 1 {
  if (a.msat < b.msat) return -1
  if (a.msat > b.msat) return 1
  return 0
}

/** True iff the two amounts represent the same msat value. */
export function equals(a: Amount, b: Amount): boolean {
  return a.msat === b.msat
}

/** Convenience constant for the zero amount. */
export const ZERO: Amount = { msat: 0n }

// ---------------------------------------------------------------------------
// Internal: integer division with explicit rounding mode
// ---------------------------------------------------------------------------

function divide(num: bigint, den: bigint, mode: RoundingMode): bigint {
  if (den === 0n) {
    throw new RangeError("division by zero")
  }
  const q = num / den
  const r = num % den
  if (r === 0n) return q
  switch (mode) {
    case "trunc":
      return q
    case "floor":
      // BigInt division truncates toward zero; for negatives we need q-1.
      return r !== 0n && (num < 0n) !== (den < 0n) ? q - 1n : q
    case "ceil":
      return r !== 0n && (num < 0n) === (den < 0n) ? q + 1n : q
    case "round": {
      // Half-to-even (banker's rounding).
      const twiceRem = (r < 0n ? -r : r) * 2n
      const absDen = den < 0n ? -den : den
      if (twiceRem < absDen) return q
      if (twiceRem > absDen) {
        return (num < 0n) !== (den < 0n) ? q - 1n : q + 1n
      }
      // Exactly half — pick the even neighbor.
      if (q % 2n === 0n) return q
      return (num < 0n) !== (den < 0n) ? q - 1n : q + 1n
    }
  }
}
