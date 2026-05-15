import { loadConfig } from "./config.js";

export function resolveBoard(input: string): number {
  const cfg = loadConfig();
  if (input in cfg.boards) return cfg.boards[input];
  const n = Number(input);
  if (Number.isInteger(n) && n > 0) return n;
  const known = Object.keys(cfg.boards);
  const hint =
    known.length > 0
      ? `Known aliases: ${known.join(", ")}.`
      : "No board aliases configured — run `monday config set-board <name> <id>` or `monday boards` to discover IDs.";
  throw new Error(`Unknown board "${input}". Pass a numeric board ID or a configured alias. ${hint}`);
}

export function resolveGroup(input: string): string {
  const cfg = loadConfig();
  return cfg.groups[input] ?? input;
}
