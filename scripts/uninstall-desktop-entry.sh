#!/usr/bin/env bash
set -euo pipefail

APPLICATIONS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$APPLICATIONS_DIR/cloudflare-one-gui.desktop"

rm -f "$DESKTOP_FILE"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPLICATIONS_DIR" >/dev/null 2>&1 || true
fi

echo "Removed $DESKTOP_FILE"
