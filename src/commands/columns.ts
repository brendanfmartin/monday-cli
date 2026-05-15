import { Command } from "commander";
import { resolveBoard } from "../aliases.js";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

interface BoardMeta {
  id: string;
  name: string;
  columns: Array<{ id: string; title: string; type: string; settings_str: string }>;
  groups: Array<{ id: string; title: string }>;
}

export function registerColumns(program: Command): void {
  program
    .command("columns <board>")
    .description("Show columns + groups for a board (use this to find column IDs and status labels)")
    .action(async (boardArg: string) => {
      const board = resolveBoard(boardArg);
      const data = await mondayRequest<{ boards: BoardMeta[] }>(
        `query($b: [ID!]) {
           boards(ids: $b) {
             id name
             columns { id title type settings_str }
             groups { id title }
           }
         }`,
        { b: [board] },
      );
      emit(data.boards[0] ?? null);
    });
}
