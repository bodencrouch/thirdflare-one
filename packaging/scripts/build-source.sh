#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${PACKAGE_VERSION:-$(node -p "require('${ROOT}/package.json').version")}"
OUT="${ROOT}/dist/packages"

mkdir -p "$OUT"
export PACKAGE_VERSION="$VERSION"
bash "${ROOT}/packaging/scripts/stage-payload.sh"

tar -C "${ROOT}/dist/payload" -czf "${OUT}/cloudflare-one-gui-${VERSION}.tar.gz" .
# Also ship a source-style tree useful for AUR (repo layout at root).
tar -C "$ROOT" \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='node_modules' \
  --exclude='agentdecompile_projects' \
  --exclude='packaging/flatpak/.flatpak-builder' \
  --exclude='packaging/flatpak/repo' \
  --exclude='packaging/flatpak/build' \
  --exclude='*.AppImage' \
  -czf "${OUT}/cloudflare-one-gui-${VERSION}-src.tar.gz" \
  server.js package.json LICENSE README.md CHANGELOG.md AGENTS.md \
  lib config public assets bin scripts packaging docs

echo "Built source archives in ${OUT}"
