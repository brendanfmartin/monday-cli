export function emit(data: unknown): void {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

export function emitError(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}
