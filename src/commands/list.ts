import { Command } from "commander";
import { resolveBoard, resolveGroup } from "../aliases.js";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

interface ItemsPage {
  items: Array<{ id: string; name: string }>;
}

interface GroupRow {
  id: string;
  title: string;
  items_page: ItemsPage;
}

interface BoardRow {
  id: string;
  name: string;
  groups?: GroupRow[];
  items_page?: ItemsPage;
}

export function registerList(program: Command): void {
  program
    .command("list <board>")
    .description("List items on a board, optionally scoped to a group")
    .option("-g, --group <id>", "Group ID or alias (to-do, in-progress, completed)")
    .option("-l, --limit <n>", "Max items to return", "100")
    .action(async (boardArg: string, opts: { group?: string; limit: string }) => {
      const board = resolveBoard(boardArg);
      const limit = Number(opts.limit);
      if (!Number.isInteger(limit) || limit <= 0) {
        throw new Error(`--limit must be a positive integer, got "${opts.limit}"`);
      }

      if (opts.group) {
        const group = resolveGroup(opts.group);
        const data = await mondayRequest<{ boards: BoardRow[] }>(
          `query($b: [ID!], $g: [String], $limit: Int!) {
             boards(ids: $b) {
               id name
               groups(ids: $g) {
                 id title
                 items_page(limit: $limit) { items { id name } }
               }
             }
           }`,
          { b: [board], g: [group], limit },
        );
        emit(data.boards[0]?.groups?.[0] ?? null);
        return;
      }

      const data = await mondayRequest<{ boards: BoardRow[] }>(
        `query($b: [ID!], $limit: Int!) {
           boards(ids: $b) {
             id name
             items_page(limit: $limit) { items { id name } }
           }
         }`,
        { b: [board], limit },
      );
      emit(data.boards[0] ?? null);
    });
}
