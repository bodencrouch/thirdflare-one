#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SYSTEMD_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SYSTEMD_USER_DIR/cloudflare-one-gui.service"

mkdir -p "$SYSTEMD_USER_DIR"

cat > "$SERVICE_FILE" <<SERVICE
[Unit]
Description=Cloudflare One GUI local warp-cli server
Documentation=file://$APP_DIR/README.md
After=network-online.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
Environment=PORT=4173
ExecStart=/usr/bin/env node server.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
SERVICE

echo "Installed $SERVICE_FILE"

if systemctl --user daemon-reload >/dev/null 2>&1; then
  echo "Reloaded user systemd manager."
  echo "Enable with: systemctl --user enable --now cloudflare-one-gui.service"
else
  echo "User systemd manager is not reachable. Enable later with:"
  echo "  systemctl --user daemon-reload"
  echo "  systemctl --user enable --now cloudflare-one-gui.service"
fi
