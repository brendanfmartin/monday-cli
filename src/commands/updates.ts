import { Command } from "commander";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

interface ItemWithUpdates {
  id: string;
  name: string;
  updates: Array<{
    id: string;
    body: string;
    created_at: string;
    creator: { name: string } | null;
  }>;
}

export function registerUpdates(program: Command): void {
  program
    .command("updates <item>")
    .description("Read updates (Notes / comments) on an item")
    .action(async (item: string) => {
      const data = await mondayRequest<{ items: ItemWithUpdates[] }>(
        `query($i: [ID!]) {
           items(ids: $i) {
             id name
             updates { id body created_at creator { name } }
           }
         }`,
        { i: [item] },
      );
      emit(data.items[0] ?? null);
    });
}
