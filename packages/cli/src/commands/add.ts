/**
 * `bitcoin-ui add <name>` — resolves the component's manifest, walks the
 * dependency graph, applies path/alias transforms, writes the files,
 * installs npm deps via the detected package manager.
 *
 * Status: Phase 0 — stub.
 */

export interface AddOptions {
  yes?: boolean
  overwrite?: boolean
}

export async function add(components: string[], options: AddOptions = {}): Promise<void> {
  void components
  void options
  throw new Error("TODO(phase-0): implement add")
}
