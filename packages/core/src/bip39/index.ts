/**
 * BIP39 mnemonic wordlist + checksum.
 *
 * Wordlists are loaded lazily by language to keep bundle size small.
 *
 * Status: Phase 0 — stub.
 */

export type WordCount = 12 | 15 | 18 | 21 | 24

export type Language =
  | "english"
  | "japanese"
  | "korean"
  | "spanish"
  | "chinese_simplified"
  | "chinese_traditional"
  | "french"
  | "italian"
  | "czech"
  | "portuguese"

export interface ValidateResult {
  readonly ok: boolean
  readonly checksumValid: boolean
  readonly unknownWords: readonly string[]
}

export async function loadWordlist(_language: Language): Promise<readonly string[]> {
  throw new Error("TODO(phase-0): implement loadWordlist")
}

export async function validateMnemonic(
  _words: readonly string[],
  _language?: Language,
): Promise<ValidateResult> {
  throw new Error("TODO(phase-0): implement validateMnemonic")
}

export function suggestCompletions(
  _prefix: string,
  _wordlist: readonly string[],
): readonly string[] {
  throw new Error("TODO(phase-0): implement suggestCompletions")
}
