#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${ROOT_DIR}/.dev-dashboard"
PORT="${APP_PORT:-8080}"

if [[ -f "${STATE_DIR}/server.pid" ]]; then
  pid="$(tr -dc '0-9' < "${STATE_DIR}/server.pid")"
  [[ -n "${pid}" ]] && kill "${pid}" >/dev/null 2>&1 || true
  : > "${STATE_DIR}/server.pid"
fi

while IFS= read -r pid; do
  [[ -n "${pid}" ]] && kill "${pid}" >/dev/null 2>&1 || true
done < <(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)