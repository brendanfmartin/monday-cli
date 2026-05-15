#!/usr/bin/env node
import { Command } from "commander";
import { registerArchive } from "./commands/archive.js";
import { registerBoards } from "./commands/boards.js";
import { registerColumns } from "./commands/columns.js";
import { registerConfig } from "./commands/config.js";
import { registerCreate } from "./commands/create.js";
import { registerDelete } from "./commands/delete.js";
import { registerList } from "./commands/list.js";
import { registerLookup } from "./commands/lookup.js";
import { registerMove } from "./commands/move.js";
import { registerNote } from "./commands/note.js";
import { registerRaw } from "./commands/raw.js";
import { registerUpdate } from "./commands/update.js";
import { registerUpdates } from "./commands/updates.js";
import { emitError } from "./output.js";

const program = new Command();
program
  .name("monday")
  .description("Personal CLI for the Monday.com GraphQL API")
  .version("0.1.0");

registerList(program);
registerLookup(program);
registerColumns(program);
registerBoards(program);
registerMove(program);
registerUpdate(program);
registerCreate(program);
registerNote(program);
registerUpdates(program);
registerArchive(program);
registerDelete(program);
registerRaw(program);
registerConfig(program);

program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string" &&
    ((err as { code: string }).code.startsWith("commander.help") ||
      (err as { code: string }).code === "commander.version")
  ) {
    process.exit(0);
  }
  emitError(err);
}
