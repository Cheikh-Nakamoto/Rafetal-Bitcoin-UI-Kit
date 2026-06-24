/**
 * Wallet provider abstraction over WebLN, NWC (NIP-47), and BitcoinConnect.
 *
 * Capability discovery lets callers branch on what a connected wallet can do
 * (`canMakeInvoice`, `canSignMessage`, etc.) rather than try/catch.
 *
 * Status: Phase 0 — stub.
 */
import type { Amount } from "../units/index.js"

export type ProviderKind = "webln" | "nwc" | "bitcoin-connect" | "custom"

export interface WalletCapabilities {
  readonly canMakeInvoice: boolean
  readonly canPayInvoice: boolean
  readonly canSignMessage: boolean
  readonly canGetBalance: boolean
  readonly canKeysend: boolean
}

export interface WalletProvider {
  readonly kind: ProviderKind
  readonly name: string
  readonly capabilities: WalletCapabilities

  connect(): Promise<void>
  disconnect(): Promise<void>
  getBalance?(): Promise<Amount>
  makeInvoice?(opts: { amount: Amount; memo?: string }): Promise<string>
  payInvoice?(bolt11: string): Promise<{ preimage: string }>
  signMessage?(message: string): Promise<{ signature: string; address: string }>
}

export function detectProviders(): readonly WalletProvider[] {
  throw new Error("TODO(phase-0): implement detectProviders")
}
