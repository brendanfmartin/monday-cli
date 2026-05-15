import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "monday-cli");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export interface Config {
  boards: Record<string, number>;
  groups: Record<string, string>;
}

const EMPTY: Config = { boards: {}, groups: {} };

let cached: Config | null = null;

export function loadConfig(): Config {
  if (cached) return cached;
  if (!existsSync(CONFIG_PATH)) {
    cached = { ...EMPTY };
    return cached;
  }
  let raw: string;
  try {
    raw = readFileSync(CONFIG_PATH, "utf8");
  } catch (err) {
    throw new Error(`Failed to read ${CONFIG_PATH}: ${err instanceof Error ? err.message : String(err)}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${CONFIG_PATH} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${CONFIG_PATH} must be a JSON object`);
  }
  const obj = parsed as Partial<Config>;
  cached = {
    boards: obj.boards && typeof obj.boards === "object" ? obj.boards : {},
    groups: obj.groups && typeof obj.groups === "object" ? obj.groups : {},
  };
  return cached;
}

export function saveConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf8");
  cached = config;
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}
