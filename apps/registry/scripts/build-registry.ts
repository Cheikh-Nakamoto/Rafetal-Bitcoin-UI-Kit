/**
 * Builds the static JSON manifests served at `/r/<name>.json`.
 *
 * - Reads every `apps/registry/registry/<style>/<name>.tsx`.
 * - Reads its frontmatter-style header for category, dependencies, etc.
 * - Emits a manifest matching the shadcn-ui `registry-item.json` shape.
 *
 * Status: Phase 0 — stub. Real implementation in Phase 1.
 */
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const REGISTRY_DIR = join(process.cwd(), "registry")
const OUTPUT_DIR = join(process.cwd(), "public", "r")

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  // eslint-disable-next-line no-console
  console.log(`[build-registry] registry dir: ${REGISTRY_DIR}`)
  // eslint-disable-next-line no-console
  console.log(`[build-registry] output dir:   ${OUTPUT_DIR}`)
  // eslint-disable-next-line no-console
  console.log("[build-registry] TODO(phase-1): walk registry/, emit manifests")
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
