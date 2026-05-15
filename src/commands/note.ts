import { Command } from "commander";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

export function registerNote(program: Command): void {
  program
    .command("note <item> <body>")
    .description("Post an update (a.k.a. Note / comment) on an item")
    .action(async (item: string, body: string) => {
      const data = await mondayRequest<{ create_update: { id: string } }>(
        `mutation($i: ID!, $b: String!) {
           create_update(item_id: $i, body: $b) { id }
         }`,
        { i: item, b: body },
      );
      emit(data.create_update);
    });
}
