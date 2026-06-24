import { describe, expect, it } from "vitest"
import {
  type Amount,
  MSATS_PER_BTC,
  MSATS_PER_SAT,
  SATS_PER_BTC,
  ZERO,
  add,
  compare,
  equals,
  fromBtcString,
  fromMsat,
  fromSat,
  fromSatString,
  multiply,
  scale,
  subtract,
  sum,
  toBtcString,
  toMsat,
  toSat,
} from "./index"

const ok = <T>(r: { ok: true; value: T } | { ok: false; reason: string }): T => {
  if (!r.ok) throw new Error(`expected ok, got: ${r.reason}`)
  return r.value
}

describe("constants", () => {
  it("matches the canonical Bitcoin definitions", () => {
    expect(SATS_PER_BTC).toBe(100_000_000n)
    expect(MSATS_PER_SAT).toBe(1_000n)
    expect(MSATS_PER_BTC).toBe(100_000_000_000n)
  })
})

describe("fromSat / toSat", () => {
  it("round-trips integer sats", () => {
    for (const s of [0n, 1n, 21n, 100_000n, SATS_PER_BTC, 21_000_000n * SATS_PER_BTC]) {
      expect(toSat(fromSat(s))).toBe(s)
    }
  })

  it("rejects non-bigint inputs at the type boundary", () => {
    // @ts-expect-error — intentional misuse to verify runtime guard
    expect(() => fromSat(123)).toThrow(TypeError)
    // @ts-expect-error
    expect(() => fromSat("123")).toThrow(TypeError)
  })

  it("supports negative sats (e.g. for net-position math)", () => {
    expect(toSat(fromSat(-50_000n))).toBe(-50_000n)
  })
})

describe("fromMsat / toMsat", () => {
  it("preserves Lightning sub-sat precision", () => {
    const a = fromMsat(1_500n)
    expect(toMsat(a)).toBe(1_500n)
    // Default truncation drops the 500 msat remainder.
    expect(toSat(a)).toBe(1n)
  })

  it("rounding modes behave correctly at the sat boundary", () => {
    const a = fromMsat(1_500n) // 1.5 sat
    expect(toSat(a, { rounding: "trunc" })).toBe(1n)
    expect(toSat(a, { rounding: "floor" })).toBe(1n)
    expect(toSat(a, { rounding: "ceil" })).toBe(2n)
    expect(toSat(a, { rounding: "round" })).toBe(2n) // half-to-even: 2 is even
  })

  it("banker's rounding picks the even neighbor on exact halves", () => {
    expect(toSat(fromMsat(2_500n), { rounding: "round" })).toBe(2n) // 2.5 → 2
    expect(toSat(fromMsat(3_500n), { rounding: "round" })).toBe(4n) // 3.5 → 4
    expect(toSat(fromMsat(4_500n), { rounding: "round" })).toBe(4n) // 4.5 → 4
    expect(toSat(fromMsat(5_500n), { rounding: "round" })).toBe(6n) // 5.5 → 6
  })

  it("rounding modes behave correctly for negative msat", () => {
    const a = fromMsat(-1_500n)
    expect(toSat(a, { rounding: "trunc" })).toBe(-1n)
    expect(toSat(a, { rounding: "floor" })).toBe(-2n)
    expect(toSat(a, { rounding: "ceil" })).toBe(-1n)
    expect(toSat(a, { rounding: "round" })).toBe(-2n) // -1.5 → -2 (even)
  })
})

describe("fromBtcString", () => {
  it("parses common decimal forms exactly", () => {
    expect(ok(fromBtcString("1")).msat).toBe(MSATS_PER_BTC)
    expect(ok(fromBtcString("0.00000001")).msat).toBe(MSATS_PER_SAT) // 1 sat
    expect(ok(fromBtcString("21000000")).msat).toBe(21_000_000n * MSATS_PER_BTC)
    expect(ok(fromBtcString("0")).msat).toBe(0n)
    expect(ok(fromBtcString("0.00000000")).msat).toBe(0n)
  })

  it("parses negatives and explicit plus signs", () => {
    expect(ok(fromBtcString("-0.5")).msat).toBe(-50_000_000n * MSATS_PER_SAT)
    expect(ok(fromBtcString("+1.00000000")).msat).toBe(MSATS_PER_BTC)
  })

  it("ignores surrounding whitespace", () => {
    expect(ok(fromBtcString("  0.001  "))).toEqual({ msat: 100_000_000n })
  })

  it("rejects malformed input as data, never throws", () => {
    expect(fromBtcString("abc").ok).toBe(false)
    expect(fromBtcString("").ok).toBe(false)
    expect(fromBtcString("1.2.3").ok).toBe(false)
    expect(fromBtcString("0,5").ok).toBe(false)
    expect(fromBtcString("1e3").ok).toBe(false)
    expect(fromBtcString(".5").ok).toBe(false)
    expect(fromBtcString("5.").ok).toBe(false)
  })

  it("rejects sub-sat precision (>8 decimals) with a helpful reason", () => {
    const r = fromBtcString("0.000000001") // 9 decimals
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.reason).toMatch(/fractional digits/)
      expect(r.reason).toMatch(/fromMsat/)
    }
  })

  it("famous float gotcha — 0.1 + 0.2 stays exact", () => {
    // The numeric reason BigInt math exists: this would be 0.30000000000000004 with floats.
    const total = sum([ok(fromBtcString("0.1")), ok(fromBtcString("0.2"))])
    expect(toBtcString(total, { decimals: 8 })).toBe("0.30000000")
  })
})

describe("fromSatString", () => {
  it("parses integers", () => {
    expect(ok(fromSatString("0")).msat).toBe(0n)
    expect(ok(fromSatString("100000000")).msat).toBe(MSATS_PER_BTC)
    expect(ok(fromSatString("-42")).msat).toBe(-42n * MSATS_PER_SAT)
  })

  it("rejects non-integers", () => {
    expect(fromSatString("1.5").ok).toBe(false)
    expect(fromSatString("abc").ok).toBe(false)
    expect(fromSatString("").ok).toBe(false)
  })
})

describe("toBtcString", () => {
  it("formats with full 8-decimal precision by default", () => {
    expect(toBtcString(fromSat(SATS_PER_BTC))).toBe("1.00000000")
    expect(toBtcString(fromSat(1n))).toBe("0.00000001")
    expect(toBtcString(ZERO)).toBe("0.00000000")
  })

  it("respects the decimals option and rounds via the chosen mode", () => {
    const a = fromSat(123_456_789n) // 1.23456789 BTC
    expect(toBtcString(a, { decimals: 8 })).toBe("1.23456789")
    expect(toBtcString(a, { decimals: 4 })).toBe("1.2345")
    expect(toBtcString(a, { decimals: 4, rounding: "ceil" })).toBe("1.2346")
    expect(toBtcString(a, { decimals: 0 })).toBe("1")
    expect(toBtcString(a, { decimals: 0, rounding: "round" })).toBe("1")
  })

  it("preserves the sign for negative amounts", () => {
    expect(toBtcString(fromSat(-1n))).toBe("-0.00000001")
    expect(toBtcString(fromSat(-SATS_PER_BTC))).toBe("-1.00000000")
  })

  it("rejects out-of-range decimals", () => {
    expect(() => toBtcString(fromSat(0n), { decimals: -1 })).toThrow(RangeError)
    expect(() => toBtcString(fromSat(0n), { decimals: 9 })).toThrow(RangeError)
    expect(() => toBtcString(fromSat(0n), { decimals: 1.5 })).toThrow(RangeError)
  })
})

describe("round-trip invariants", () => {
  it("fromBtcString → toBtcString is identity for valid 8-decimal inputs", () => {
    for (const s of ["1.00000000", "0.00000001", "21000000.00000000", "-0.50000000"]) {
      expect(toBtcString(ok(fromBtcString(s)))).toBe(s)
    }
  })

  it("fromSat → toSat is exact for the full supply", () => {
    const cap = 21_000_000n * SATS_PER_BTC
    expect(toSat(fromSat(cap))).toBe(cap)
  })
})

describe("arithmetic", () => {
  it("sums correctly and treats empty as zero", () => {
    expect(sum([]).msat).toBe(0n)
    expect(sum([fromSat(10n), fromSat(20n), fromSat(30n)]).msat).toBe(60n * MSATS_PER_SAT)
  })

  it("add / subtract behave as expected", () => {
    expect(add(fromSat(10n), fromSat(5n)).msat).toBe(15n * MSATS_PER_SAT)
    expect(subtract(fromSat(10n), fromSat(15n)).msat).toBe(-5n * MSATS_PER_SAT)
  })

  it("multiply requires a bigint factor", () => {
    expect(multiply(fromSat(10n), 3n).msat).toBe(30n * MSATS_PER_SAT)
    // @ts-expect-error — number factor is intentionally refused
    expect(() => multiply(fromSat(10n), 3)).toThrow(TypeError)
  })

  it("scale uses integer ratios with deterministic rounding", () => {
    // 1% of 1 BTC
    const onePct = scale(fromSat(SATS_PER_BTC), 1n, 100n)
    expect(toSat(onePct)).toBe(1_000_000n)

    // 0.5% fee with floor rounding (favor the user)
    const fee = scale(fromSat(1_000n), 5n, 1_000n, "floor")
    expect(toSat(fee)).toBe(5n)

    // ceil for outbound charges
    const upper = scale(fromMsat(1n), 1n, 2n, "ceil")
    expect(toMsat(upper)).toBe(1n)

    expect(() => scale(fromSat(1n), 1n, 0n)).toThrow(RangeError)
  })
})

describe("compare / equals / ZERO", () => {
  it("orders amounts correctly", () => {
    expect(compare(fromSat(1n), fromSat(2n))).toBe(-1)
    expect(compare(fromSat(2n), fromSat(2n))).toBe(0)
    expect(compare(fromSat(3n), fromSat(2n))).toBe(1)
  })

  it("equals is exact on msat", () => {
    expect(equals(fromSat(1n), fromMsat(1_000n))).toBe(true)
    expect(equals(fromSat(1n), fromMsat(1_001n))).toBe(false)
  })

  it("ZERO is the additive identity", () => {
    const a: Amount = fromSat(42n)
    expect(equals(add(a, ZERO), a)).toBe(true)
  })
})

describe("large values", () => {
  it("represents the 21M cap without precision loss", () => {
    const supply = 21_000_000n * MSATS_PER_BTC
    const a = fromMsat(supply)
    expect(toMsat(a)).toBe(supply)
    expect(toSat(a)).toBe(21_000_000n * SATS_PER_BTC)
    expect(toBtcString(a)).toBe("21000000.00000000")
  })
})
