import { Command } from "commander";
import { getConfigPath, loadConfig, saveConfig } from "../config.js";
import { emit } from "../output.js";

export function registerConfig(program: Command): void {
  const config = program
    .command("config")
    .description("Manage monday-cli config (board/group aliases)");

  config
    .command("show")
    .description("Print the current config file path and contents")
    .action(() => {
      const cfg = loadConfig();
      emit({ path: getConfigPath(), boards: cfg.boards, groups: cfg.groups });
    });

  config
    .command("set-board <name> <id>")
    .description("Alias a board name to a numeric board ID")
    .action((name: string, idStr: string) => {
      const id = Number(idStr);
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error(`Board ID must be a positive integer, got "${idStr}"`);
      }
      const cfg = loadConfig();
      cfg.boards[name] = id;
      saveConfig(cfg);
      emit({ boards: cfg.boards });
    });

  config
    .command("set-group <name> <id>")
    .description("Alias a group name to a Monday group_id string")
    .action((name: string, id: string) => {
      if (!id) throw new Error("Group ID is required");
      const cfg = loadConfig();
      cfg.groups[name] = id;
      saveConfig(cfg);
      emit({ groups: cfg.groups });
    });

  config
    .command("unset-board <name>")
    .description("Remove a board alias")
    .action((name: string) => {
      const cfg = loadConfig();
      delete cfg.boards[name];
      saveConfig(cfg);
      emit({ boards: cfg.boards });
    });

  config
    .command("unset-group <name>")
    .description("Remove a group alias")
    .action((name: string) => {
      const cfg = loadConfig();
      delete cfg.groups[name];
      saveConfig(cfg);
      emit({ groups: cfg.groups });
    });
}
