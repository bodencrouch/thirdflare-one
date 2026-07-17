#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
APPLICATIONS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$APPLICATIONS_DIR/cloudflare-one-gui.desktop"

mkdir -p "$APPLICATIONS_DIR"

cat > "$DESKTOP_FILE" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Cloudflare One GUI
Comment=Manage Cloudflare WARP on Linux with a Windows-style GUI
Exec=$APP_DIR/bin/cloudflare-one-gui
Icon=$APP_DIR/assets/cloudflare-one-gui.svg
Terminal=false
Categories=Network;
Keywords=Cloudflare;WARP;Zero Trust;VPN;DNS;
StartupNotify=true
Actions=Connect;Disconnect;Toggle;Status;Tray;

[Desktop Action Connect]
Name=Connect WARP
Exec=$APP_DIR/bin/cloudflare-one-gui --connect
Icon=$APP_DIR/assets/cloudflare-one-gui.svg

[Desktop Action Disconnect]
Name=Disconnect WARP
Exec=$APP_DIR/bin/cloudflare-one-gui --disconnect
Icon=$APP_DIR/assets/cloudflare-one-gui.svg

[Desktop Action Toggle]
Name=Toggle WARP
Exec=$APP_DIR/bin/cloudflare-one-gui --toggle
Icon=$APP_DIR/assets/cloudflare-one-gui.svg

[Desktop Action Status]
Name=Show WARP Status
Exec=$APP_DIR/bin/cloudflare-one-gui
Icon=$APP_DIR/assets/cloudflare-one-gui.svg

[Desktop Action Tray]
Name=Start Tray Menu
Exec=$APP_DIR/bin/cloudflare-one-gui --tray
Icon=$APP_DIR/assets/cloudflare-one-gui.svg
DESKTOP

chmod 0644 "$DESKTOP_FILE"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPLICATIONS_DIR" >/dev/null 2>&1 || true
fi

echo "Installed $DESKTOP_FILE"
