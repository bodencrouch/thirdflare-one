#!/usr/bin/env bash
set -euo pipefail

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database /usr/share/applications >/dev/null 2>&1 || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f /usr/share/icons/hicolor >/dev/null 2>&1 || true
fi

if [[ -f /usr/share/polkit-1/actions/com.thirdflare.one.policy ]] && command -v pkaction >/dev/null 2>&1; then
  pkaction --version >/dev/null 2>&1 || true
fi
