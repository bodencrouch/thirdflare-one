#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${PACKAGE_VERSION:-$(node -p "require('${ROOT}/package.json').version")}"
OUT="${ROOT}/dist/packages"

mkdir -p "$OUT"

# Optional GPG signing when GPG_PRIVATE_KEY / GPG_PASSPHRASE are provided.
if [[ -n "${GPG_PRIVATE_KEY:-}" ]]; then
  echo "Importing GPG key for package signing..."
  gnupg_home="$(mktemp -d)"
  export GNUPGHOME="$gnupg_home"
  printf '%s\n' "$GPG_PRIVATE_KEY" | gpg --batch --import
  # Signing individual packages is package-format specific; checksums remain the baseline.
  echo "GPG key imported. Attach signatures manually or extend this script per format."
fi

(
  cd "$OUT"
  shopt -s nullglob
  files=( *.deb *.rpm *.AppImage *.flatpak *.snap *.pkg.tar.zst *.tar.gz PKGBUILD )
  if ((${#files[@]} == 0)); then
    echo "No package artifacts found in $OUT" >&2
    exit 1
  fi
  sha256sum "${files[@]}" | tee SHA256SUMS
)

# Emit a versioned PKGBUILD for AUR packagers alongside release artifacts.
sed "s/__VERSION__/${VERSION}/g" "${ROOT}/packaging/arch/PKGBUILD.in" > "${OUT}/PKGBUILD"
echo "Wrote ${OUT}/PKGBUILD and ${OUT}/SHA256SUMS"
