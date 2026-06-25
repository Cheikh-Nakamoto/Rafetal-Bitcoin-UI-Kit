/**
 * `bitcoin-ui` CLI entrypoint.
 *
 * Status: Phase 0 — wires up commands but each command throws TODO. The
 * full implementation lands in Phase 1.
 */
import { cac } from "cac"
import { add } from "./commands/add.js"
import { diff } from "./commands/diff.js"
import { init } from "./commands/init.js"
import { list } from "./commands/list.js"

const cli = cac("bitcoin-ui")

cli
  .command("init", "Initialize bitcoin-ui in the current project")
  .option("-y, --yes", "Skip prompts and accept defaults")
  .action(init)

cli
  .command("add [...components]", "Add one or more components to your project")
  .option("-y, --yes", "Skip overwrite prompts")
  .option("--overwrite", "Overwrite existing files without prompting")
  .action(add)

cli.command("diff [component]", "Diff your local copy against the registry version").action(diff)

cli.command("list", "List all available components in the registry").action(list)

cli.version("0.0.0")
cli.help()
cli.parse()
