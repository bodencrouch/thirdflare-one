#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
APPLICATIONS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="$APPLICATIONS_DIR/thirdflare.desktop"
LEGACY_FILE="$APPLICATIONS_DIR/cloudflare-one-gui.desktop"

mkdir -p "$APPLICATIONS_DIR"

cat > "$DESKTOP_FILE" <<DESKTOP
[Desktop Entry]
Type=Application
Name=ThirdFlare One
Comment=Unofficial cross-platform Cloudflare One client
Exec=$APP_DIR/bin/thirdflare
Icon=$APP_DIR/assets/thirdflare.svg
Terminal=false
Categories=Network;
Keywords=Cloudflare;WARP;Zero Trust;ThirdFlare One;VPN;DNS;
StartupNotify=true
Actions=Connect;Disconnect;Toggle;Status;Tray;

[Desktop Action Connect]
Name=Connect WARP
Exec=$APP_DIR/bin/thirdflare --connect
Icon=$APP_DIR/assets/thirdflare.svg

[Desktop Action Disconnect]
Name=Disconnect WARP
Exec=$APP_DIR/bin/thirdflare --disconnect
Icon=$APP_DIR/assets/thirdflare.svg

[Desktop Action Toggle]
Name=Toggle WARP
Exec=$APP_DIR/bin/thirdflare --toggle
Icon=$APP_DIR/assets/thirdflare.svg

[Desktop Action Status]
Name=Show WARP Status
Exec=$APP_DIR/bin/thirdflare
Icon=$APP_DIR/assets/thirdflare.svg

[Desktop Action Tray]
Name=Start Tray Menu
Exec=$APP_DIR/bin/thirdflare --tray
Icon=$APP_DIR/assets/thirdflare.svg
DESKTOP

cp "$DESKTOP_FILE" "$LEGACY_FILE"
chmod 0644 "$DESKTOP_FILE" "$LEGACY_FILE"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPLICATIONS_DIR" >/dev/null 2>&1 || true
fi

echo "Installed $DESKTOP_FILE (legacy alias: $LEGACY_FILE)"
