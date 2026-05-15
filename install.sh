#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/brendanfmartin/monday-cli.git"
DEFAULT_DIR="${MONDAY_CLI_HOME:-$HOME/.monday-cli}"

# Sanity-check required tools so users get a clear message instead of npm/git noise.
for cmd in git node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "error: \`$cmd\` is required but not installed" >&2
    exit 1
  fi
done

# Pick the target directory:
#   - if this script lives next to a package.json (i.e. it's running from inside a
#     cloned monday-cli checkout), install in place
#   - otherwise (curl | bash, piped from stdin, or run from a random dir) clone
#     into $DEFAULT_DIR and install there
SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || true)"
fi

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/package.json" ]; then
  TARGET="$SCRIPT_DIR"
  echo "→ installing from existing checkout at $TARGET"
elif [ -d "$DEFAULT_DIR/.git" ]; then
  TARGET="$DEFAULT_DIR"
  echo "→ updating existing install at $TARGET"
  git -C "$TARGET" pull --ff-only
else
  TARGET="$DEFAULT_DIR"
  echo "→ cloning $REPO_URL into $TARGET"
  git clone "$REPO_URL" "$TARGET"
fi

cd "$TARGET"

echo "→ npm install"
npm install

echo "→ npm run build"
npm run build

echo "→ npm link"
npm link

echo ""
echo "✓ monday installed at $(command -v monday)"
echo "  Try: monday --help"
echo "  Set MONDAY_API_TOKEN in your shell config (.zshenv / .zshrc / .bashrc) before running real commands."
echo "  Re-run this script anytime to update: bash $TARGET/install.sh"
