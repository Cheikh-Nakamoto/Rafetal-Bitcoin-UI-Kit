/**
 * Network-aware Bitcoin address validation.
 *
 * Supports P2PKH, P2SH, P2WPKH, P2WSH, P2TR (bech32m) on mainnet, testnet,
 * signet, regtest. Errors are returned as data — never thrown.
 *
 * Status: Phase 0 — stub.
 */

export type Network = "mainnet" | "testnet" | "signet" | "regtest"

export type AddressType = "p2pkh" | "p2sh" | "p2wpkh" | "p2wsh" | "p2tr"

export interface AddressInfo {
  readonly type: AddressType
  readonly network: Network
  readonly bech32: boolean
}

export type ValidateResult =
  | { ok: true; info: AddressInfo }
  | { ok: false; reason: "invalid-format" | "wrong-network" | "unsupported-version" }

export function validateAddress(_address: string, _expected: Network): ValidateResult {
  throw new Error("TODO(phase-0): implement validateAddress")
}

export function detectNetwork(_address: string): Network | null {
  throw new Error("TODO(phase-0): implement detectNetwork")
}
