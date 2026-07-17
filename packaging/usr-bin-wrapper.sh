#!/usr/bin/env bash
# Thin PATH wrapper installed to /usr/bin/cloudflare-one-gui
exec /usr/lib/cloudflare-one-gui/bin/cloudflare-one-gui "$@"
