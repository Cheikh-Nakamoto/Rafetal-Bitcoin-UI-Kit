/**
 * `bitcoin-ui init` — creates components.json in the user's project, injects
 * Tailwind preset, writes design-token CSS vars to globals.css.
 *
 * Status: Phase 0 — stub.
 */

export interface InitOptions {
  yes?: boolean
}

export async function init(options: InitOptions = {}): Promise<void> {
  void options
  throw new Error("TODO(phase-0): implement init")
}
