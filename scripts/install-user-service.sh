#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SYSTEMD_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SYSTEMD_USER_DIR/thirdflare.service"
LEGACY_FILE="$SYSTEMD_USER_DIR/cloudflare-one-gui.service"

mkdir -p "$SYSTEMD_USER_DIR"

cat > "$SERVICE_FILE" <<SERVICE
[Unit]
Description=ThirdFlare One daemon
Documentation=file://$APP_DIR/README.md
After=network-online.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
EnvironmentFile=-$HOME/.config/thirdflare/env
Environment=THIRDFLARE_WEBUI=0
Environment=THIRDFLARE_PORT=4173
ExecStart=/usr/bin/env node server.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
SERVICE

rm -f "$LEGACY_FILE"

echo "Installed $SERVICE_FILE"

if systemctl --user daemon-reload >/dev/null 2>&1; then
  echo "Reloaded user systemd manager."
  echo "Enable with: systemctl --user enable --now thirdflare.service"
else
  echo "User systemd manager is not reachable. Enable later with:"
  echo "  systemctl --user daemon-reload"
  echo "  systemctl --user enable --now thirdflare.service"
fi
