/**
 * Mempool client — defaults to mempool.space, supports self-hosted endpoints.
 *
 * REST API + WebSocket for live updates. No telemetry, no API keys required.
 *
 * Status: Phase 0 — stub.
 */
import type { Network } from "../address/index.js"
import type { FeeEstimates } from "../fees/index.js"

export interface MempoolClientOptions {
  /** Base URL. Defaults depend on network. */
  baseUrl?: string
  /** Network. Defaults to "mainnet". */
  network?: Network
  /** Custom fetch (e.g. for SSR). */
  fetch?: typeof globalThis.fetch
}

export interface MempoolClient {
  getBlockHeight(): Promise<number>
  getFeeEstimates(): Promise<FeeEstimates>
  getAddressBalance(address: string): Promise<{ confirmed: bigint; unconfirmed: bigint }>
  subscribeBlockHeight(onUpdate: (height: number) => void): () => void
}

export function createMempoolClient(_options?: MempoolClientOptions): MempoolClient {
  throw new Error("TODO(phase-0): implement createMempoolClient")
}
