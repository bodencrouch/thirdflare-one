#!/usr/bin/env bash
# Legacy PATH wrapper — forwards to thirdflare.
exec /usr/lib/thirdflare/bin/cloudflare-one-gui "$@"
