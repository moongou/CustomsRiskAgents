#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${ROOT_DIR}/.dev-dashboard"
PORT="${APP_PORT:-8080}"
mkdir -p "${STATE_DIR}"

cleanup() { "${ROOT_DIR}/scripts/dev-dashboard-stop.sh" >/dev/null 2>&1 || true; }
trap cleanup INT TERM EXIT
cleanup

(
  cd "${ROOT_DIR}"
  exec python3 -m http.server "${PORT}" --bind 127.0.0.1
) &
printf '%s\n' "$!" > "${STATE_DIR}/server.pid"

# wait for port
for _ in $(seq 1 40); do
  lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1 && break
  sleep 0.25
done

while kill -0 "$(cat "${STATE_DIR}/server.pid")" >/dev/null 2>&1; do
  sleep 2
done
exit 1