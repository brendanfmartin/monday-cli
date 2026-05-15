import { Command } from "commander";
import { resolveBoard } from "../aliases.js";
import { mondayRequest, parseColumnPairs } from "../client.js";
import { emit } from "../output.js";

export function registerUpdate(program: Command): void {
  program
    .command("update <item> [pairs...]")
    .description("Update column values on an item. Pairs are col_id=value; value is JSON-parsed when possible.")
    .requiredOption("-b, --board <board>", "Board ID or alias (item_id alone is ambiguous)")
    .action(
      async (item: string, pairs: string[], opts: { board: string }) => {
        if (pairs.length === 0) {
          throw new Error("At least one col_id=value pair is required");
        }
        const board = resolveBoard(opts.board);
        const columnValues = parseColumnPairs(pairs);

        const data = await mondayRequest<{
          change_multiple_column_values: { id: string; name: string };
        }>(
          `mutation($b: ID!, $i: ID!, $c: JSON!) {
             change_multiple_column_values(board_id: $b, item_id: $i, column_values: $c) {
               id name
             }
           }`,
          { b: board, i: item, c: JSON.stringify(columnValues) },
        );
        emit(data.change_multiple_column_values);
      },
    );
}
