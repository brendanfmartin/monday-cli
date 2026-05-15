import { Command } from "commander";
import { resolveBoard, resolveGroup } from "../aliases.js";
import { mondayRequest, parseColumnPairs } from "../client.js";
import { emit } from "../output.js";

export function registerCreate(program: Command): void {
  program
    .command("create <board> <group> <name>")
    .description("Create a new item. Optional --col col_id=value (repeatable).")
    .option(
      "-c, --col <pair>",
      "col_id=value (repeatable); value is JSON-parsed when possible",
      (val: string, prev: string[]) => [...prev, val],
      [] as string[],
    )
    .action(
      async (
        boardArg: string,
        groupArg: string,
        name: string,
        opts: { col: string[] },
      ) => {
        const board = resolveBoard(boardArg);
        const group = resolveGroup(groupArg);
        const columnValues = parseColumnPairs(opts.col);

        const data = await mondayRequest<{ create_item: { id: string; name: string } }>(
          `mutation($b: ID!, $g: String!, $n: String!, $c: JSON!) {
             create_item(board_id: $b, group_id: $g, item_name: $n, column_values: $c) {
               id name
             }
           }`,
          {
            b: board,
            g: group,
            n: name,
            c: JSON.stringify(columnValues),
          },
        );
        emit(data.create_item);
      },
    );
}
