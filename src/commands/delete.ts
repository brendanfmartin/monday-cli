import { Command } from "commander";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

export function registerDelete(program: Command): void {
  program
    .command("delete <item>")
    .description("Permanently delete an item (not recoverable)")
    .action(async (item: string) => {
      const data = await mondayRequest<{ delete_item: { id: string } }>(
        `mutation($i: ID!) { delete_item(item_id: $i) { id } }`,
        { i: item },
      );
      emit(data.delete_item);
    });
}
