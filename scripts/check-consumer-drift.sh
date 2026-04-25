#!/usr/bin/env bash
# scripts/check-consumer-drift.sh
#
# Verify that bikinbot-fe and bikinbot-be pin the SAME bikinbot-shared SHA.
# Run from CI in either FE or BE repo, or manually from any clone of shared.
#
# Usage:
#   ./scripts/check-consumer-drift.sh /path/to/bikinbot-fe /path/to/bikinbot-be
#
# Exit codes:
#   0 = same SHA
#   1 = drift detected
#   2 = invocation error

set -uo pipefail

if [ $# -lt 2 ]; then
  echo "usage: $0 <path-to-bikinbot-fe> <path-to-bikinbot-be>" >&2
  exit 2
fi

FE_DIR="$1"
BE_DIR="$2"

extract_sha() {
  # Reads package.json and extracts the SHA pinned in
  # "bikinbot-shared": "github:masterbikinbot/bikinbot-shared#<sha>"
  local pkg="$1/package.json"
  if [ ! -f "$pkg" ]; then
    echo "missing-package-json"
    return
  fi
  grep -E '"bikinbot-shared"' "$pkg" \
    | head -1 \
    | sed -E 's/.*#([a-f0-9]+).*/\1/'
}

FE_SHA="$(extract_sha "$FE_DIR")"
BE_SHA="$(extract_sha "$BE_DIR")"

echo "FE pinned shared SHA: $FE_SHA"
echo "BE pinned shared SHA: $BE_SHA"

if [ "$FE_SHA" = "$BE_SHA" ] && [ "$FE_SHA" != "missing-package-json" ]; then
  echo "OK: FE and BE pin the same shared SHA."
  exit 0
fi

echo "DRIFT DETECTED — FE and BE pin different bikinbot-shared SHAs." >&2
echo "Action: align both package.json to the same SHA, run 'npm install', then commit."
exit 1
