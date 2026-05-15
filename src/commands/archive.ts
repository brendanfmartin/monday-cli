import { Command } from "commander";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

export function registerArchive(program: Command): void {
  program
    .command("archive <item>")
    .description("Archive an item (recoverable)")
    .action(async (item: string) => {
      const data = await mondayRequest<{ archive_item: { id: string } }>(
        `mutation($i: ID!) { archive_item(item_id: $i) { id } }`,
        { i: item },
      );
      emit(data.archive_item);
    });
}
