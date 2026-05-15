import { Command } from "commander";
import { resolveBoard, resolveGroup } from "../aliases.js";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

interface ItemRow {
  id: string;
  name: string;
  group?: { id: string; title: string } | null;
}

export function registerLookup(program: Command): void {
  program
    .command("lookup <board> <queries...>")
    .description(
      "Find items by name. Defaults to substring match (case-insensitive); use --exact for exact name match.",
    )
    .option("-e, --exact", "Exact name match (uses items_page_by_column_values server-side)")
    .option("-g, --group <id>", "Restrict substring search to a group (alias or ID)")
    .option(
      "-l, --limit <n>",
      "Max items to scan when doing substring search (server-side page size)",
      "200",
    )
    .action(
      async (
        boardArg: string,
        queries: string[],
        opts: { exact?: boolean; group?: string; limit: string },
      ) => {
        if (queries.length === 0) throw new Error("At least one query is required");
        const board = resolveBoard(boardArg);

        if (opts.exact) {
          const data = await mondayRequest<{
            items_page_by_column_values: { items: ItemRow[] };
          }>(
            `query($b: ID!, $n: [String]!) {
               items_page_by_column_values(
                 board_id: $b,
                 columns: [{ column_id: "name", column_values: $n }],
                 limit: 100
               ) {
                 items { id name group { id title } }
               }
             }`,
            { b: board, n: queries },
          );
          emit(data.items_page_by_column_values.items);
          return;
        }

        const limit = Number(opts.limit);
        if (!Number.isInteger(limit) || limit <= 0) {
          throw new Error(`--limit must be a positive integer, got "${opts.limit}"`);
        }

        const needles = queries.map((q) => q.toLowerCase());
        const matches: ItemRow[] = [];

        if (opts.group) {
          const group = resolveGroup(opts.group);
          const data = await mondayRequest<{
            boards: Array<{
              groups: Array<{ id: string; title: string; items_page: { items: ItemRow[] } }>;
            }>;
          }>(
            `query($b: [ID!], $g: [String], $limit: Int!) {
               boards(ids: $b) {
                 groups(ids: $g) {
                   id title
                   items_page(limit: $limit) { items { id name } }
                 }
               }
             }`,
            { b: [board], g: [group], limit },
          );
          const groupRow = data.boards[0]?.groups?.[0];
          if (groupRow) {
            for (const item of groupRow.items_page.items) {
              if (needles.some((n) => item.name.toLowerCase().includes(n))) {
                matches.push({ ...item, group: { id: groupRow.id, title: groupRow.title } });
              }
            }
          }
        } else {
          const data = await mondayRequest<{
            boards: Array<{ items_page: { items: Array<ItemRow> } }>;
          }>(
            `query($b: [ID!], $limit: Int!) {
               boards(ids: $b) {
                 items_page(limit: $limit) {
                   items { id name group { id title } }
                 }
               }
             }`,
            { b: [board], limit },
          );
          const items = data.boards[0]?.items_page.items ?? [];
          for (const item of items) {
            if (needles.some((n) => item.name.toLowerCase().includes(n))) {
              matches.push(item);
            }
          }
        }

        emit(matches);
      },
    );
}
