const ENDPOINT = "https://api.monday.com/v2";
const API_VERSION = "2024-01";

export class MondayApiError extends Error {
  constructor(public errors: unknown) {
    super(typeof errors === "string" ? errors : JSON.stringify(errors, null, 2));
    this.name = "MondayApiError";
  }
}

export async function mondayRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) {
    throw new Error(
      "MONDAY_API_TOKEN not set — add `export MONDAY_API_TOKEN=...` to ~/.zshenv",
    );
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: token,
      "API-Version": API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as { data?: T; errors?: unknown };

  if (json.errors) throw new MondayApiError(json.errors);
  if (json.data == null) {
    throw new Error(`Monday returned no data (HTTP ${res.status})`);
  }
  return json.data;
}

export function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function parseColumnPairs(pairs: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const pair of pairs) {
    const eq = pair.indexOf("=");
    if (eq === -1) {
      throw new Error(`Expected key=value, got "${pair}"`);
    }
    const key = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1);
    if (!key) throw new Error(`Empty column key in "${pair}"`);
    out[key] = parseValue(value);
  }
  return out;
}
