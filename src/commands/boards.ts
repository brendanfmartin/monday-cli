import { Command } from "commander";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

interface BoardRow {
  id: string;
  name: string;
  state: string;
}

export function registerBoards(program: Command): void {
  program
    .command("boards")
    .description("List boards on your account (discover IDs to alias via `monday config set-board`)")
    .option("-a, --all", "Include non-active boards (archived, deleted)")
    .option("-l, --limit <n>", "Max boards to return", "100")
    .action(async (opts: { all?: boolean; limit: string }) => {
      const limit = Number(opts.limit);
      if (!Number.isInteger(limit) || limit <= 0) {
        throw new Error(`--limit must be a positive integer, got "${opts.limit}"`);
      }
      const data = await mondayRequest<{ boards: BoardRow[] }>(
        `query($limit: Int!) { boards(limit: $limit) { id name state } }`,
        { limit },
      );
      const boards = opts.all ? data.boards : data.boards.filter((b) => b.state === "active");
      emit(boards);
    });
}
