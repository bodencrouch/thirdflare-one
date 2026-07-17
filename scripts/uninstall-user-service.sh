#!/usr/bin/env bash
set -euo pipefail

SYSTEMD_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SYSTEMD_USER_DIR/cloudflare-one-gui.service"

if systemctl --user --quiet is-active cloudflare-one-gui.service >/dev/null 2>&1; then
  systemctl --user stop cloudflare-one-gui.service || true
fi

if systemctl --user --quiet is-enabled cloudflare-one-gui.service >/dev/null 2>&1; then
  systemctl --user disable cloudflare-one-gui.service || true
fi

rm -f "$SERVICE_FILE"

if systemctl --user daemon-reload >/dev/null 2>&1; then
  echo "Reloaded user systemd manager."
fi

echo "Removed $SERVICE_FILE"
