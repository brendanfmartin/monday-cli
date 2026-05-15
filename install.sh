#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

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
