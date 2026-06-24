/**
 * NIP-47 (Nostr Wallet Connect) helpers.
 *
 * The actual transport (relay subscriptions, NIP-04 encryption) lives here so
 * that React adapters can stay thin.
 *
 * Status: Phase 0 — stub.
 */

export interface NwcConnectionString {
  readonly pubkey: string
  readonly relay: string
  readonly secret: string
}

export function parseConnectionString(_uri: string): NwcConnectionString {
  throw new Error("TODO(phase-0): implement parseConnectionString")
}
