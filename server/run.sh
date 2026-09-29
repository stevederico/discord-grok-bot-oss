#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi
if [[ ! -d "$ROOT/node_modules/@modelcontextprotocol/sdk" ]]; then
  if command -v bun >/dev/null 2>&1; then
    bun install
  else
    npm install --omit=dev --ignore-scripts
  fi
fi
exec node "$ROOT/server/index.js"
