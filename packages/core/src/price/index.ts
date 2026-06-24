/**
 * Exchange-rate aggregator interface.
 *
 * Pluggable providers: CoinGecko, Kraken, Bitstamp, custom. Users can swap or
 * stack providers.
 *
 * Status: Phase 0 — stub.
 */

export type FiatCode = "USD" | "EUR" | "GBP" | "JPY" | "CHF" | "CAD" | "AUD" | "BRL" | (string & {})

export interface Quote {
  /** BTC price in the fiat currency, as a decimal string ("63421.50"). */
  readonly btc: string
  readonly fiat: FiatCode
  readonly source: string
  readonly fetchedAt: Date
}

export interface PriceProvider {
  readonly name: string
  getQuote(fiat: FiatCode): Promise<Quote>
}

export function aggregator(providers: readonly PriceProvider[]): PriceProvider {
  void providers
  throw new Error("TODO(phase-0): implement aggregator")
}

export function coingecko(): PriceProvider {
  throw new Error("TODO(phase-0): implement coingecko provider")
}
