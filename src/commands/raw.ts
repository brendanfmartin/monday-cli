import { Command } from "commander";
import { mondayRequest } from "../client.js";
import { emit } from "../output.js";

export function registerRaw(program: Command): void {
  program
    .command("raw <query>")
    .description("Escape hatch: send an arbitrary GraphQL query. Use --vars '<json>' for variables.")
    .option("-v, --vars <json>", "GraphQL variables as a JSON object string")
    .action(async (query: string, opts: { vars?: string }) => {
      let variables: Record<string, unknown> | undefined;
      if (opts.vars) {
        try {
          const parsed = JSON.parse(opts.vars);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            variables = parsed as Record<string, unknown>;
          } else {
            throw new Error("--vars must be a JSON object");
          }
        } catch (err) {
          throw new Error(
            `--vars is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
      const data = await mondayRequest(query, variables);
      emit(data);
    });
}
