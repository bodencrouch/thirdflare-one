#!/usr/bin/env bash
set -euo pipefail

SYSTEMD_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"

for unit in thirdflare.service cloudflare-one-gui.service; do
  if systemctl --user --quiet is-active "$unit" >/dev/null 2>&1; then
    systemctl --user stop "$unit" || true
  fi
  if systemctl --user --quiet is-enabled "$unit" >/dev/null 2>&1; then
    systemctl --user disable "$unit" || true
  fi
  rm -f "$SYSTEMD_USER_DIR/$unit"
done

if systemctl --user daemon-reload >/dev/null 2>&1; then
  echo "Reloaded user systemd manager."
fi

echo "Removed ThirdFlare One user service files."
