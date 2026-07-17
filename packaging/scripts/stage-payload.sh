#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${PACKAGE_VERSION:-$(node -p "require('${ROOT}/package.json').version")}"
DIST="${ROOT}/dist"
PAYLOAD="${DIST}/payload"
LIB="${PAYLOAD}/usr/lib/cloudflare-one-gui"

rm -rf "$PAYLOAD"
mkdir -p \
  "$LIB" \
  "${PAYLOAD}/usr/bin" \
  "${PAYLOAD}/usr/share/applications" \
  "${PAYLOAD}/usr/share/icons/hicolor/scalable/apps" \
  "${PAYLOAD}/usr/lib/systemd/user" \
  "${PAYLOAD}/usr/share/doc/cloudflare-one-gui" \
  "${PAYLOAD}/usr/share/licenses/cloudflare-one-gui"

install -m 0644 "${ROOT}/server.js" "${LIB}/server.js"
install -m 0644 "${ROOT}/package.json" "${LIB}/package.json"
install -m 0644 "${ROOT}/README.md" "${PAYLOAD}/usr/share/doc/cloudflare-one-gui/README.md"
install -m 0644 "${ROOT}/LICENSE" "${PAYLOAD}/usr/share/licenses/cloudflare-one-gui/LICENSE"
install -m 0644 "${ROOT}/CHANGELOG.md" "${PAYLOAD}/usr/share/doc/cloudflare-one-gui/CHANGELOG.md"

cp -a "${ROOT}/public" "${LIB}/public"
cp -a "${ROOT}/assets" "${LIB}/assets"
mkdir -p "${LIB}/scripts" "${LIB}/bin"
install -m 0755 "${ROOT}/scripts/health-check.mjs" "${LIB}/scripts/health-check.mjs"
install -m 0755 "${ROOT}/scripts/port-open.mjs" "${LIB}/scripts/port-open.mjs"
install -m 0755 "${ROOT}/bin/cloudflare-one-gui" "${LIB}/bin/cloudflare-one-gui"
install -m 0755 "${ROOT}/bin/cloudflare-one-tray" "${LIB}/bin/cloudflare-one-tray"

install -m 0755 "${ROOT}/packaging/usr-bin-wrapper.sh" "${PAYLOAD}/usr/bin/cloudflare-one-gui"
install -m 0644 "${ROOT}/packaging/cloudflare-one-gui.desktop" \
  "${PAYLOAD}/usr/share/applications/cloudflare-one-gui.desktop"
install -m 0644 "${ROOT}/assets/cloudflare-one-gui.svg" \
  "${PAYLOAD}/usr/share/icons/hicolor/scalable/apps/cloudflare-one-gui.svg"
install -m 0644 "${ROOT}/packaging/cloudflare-one-gui.service" \
  "${PAYLOAD}/usr/lib/systemd/user/cloudflare-one-gui.service"

printf '%s\n' "$VERSION" > "${DIST}/VERSION"
echo "Staged payload at ${PAYLOAD} (version ${VERSION})"
