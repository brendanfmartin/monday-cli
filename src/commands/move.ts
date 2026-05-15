import { Command } from "commander";
import { resolveGroup } from "../aliases.js";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

export function registerMove(program: Command): void {
  program
    .command("move <item> <group>")
    .description("Move an item to a group (group can be an alias: to-do, in-progress, completed)")
    .action(async (item: string, groupArg: string) => {
      const group = resolveGroup(groupArg);
      const data = await mondayRequest<{ move_item_to_group: { id: string; name: string } }>(
        `mutation($i: ID!, $g: String!) {
           move_item_to_group(item_id: $i, group_id: $g) { id name }
         }`,
        { i: item, g: group },
      );
      emit(data.move_item_to_group);
    });
}
