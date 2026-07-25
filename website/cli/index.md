# CLI overview

ThirdFlare One exposes three CLI layers — similar to how [Cursor CLI](https://cursor.com/docs/cli/overview) separates agent commands from install tooling, and [Render CLI](https://render.com/docs/cli) focuses on daily operations.

| Command | Role |
|---------|------|
| `thirdflare` | Daily driver — tray, WARP toggle, daemon |
| `thirdflare-one` | Operator — install, build, test, dev |
| `thirdflare-one-tray` | Tray subprocess (PyQt6 native shell) |

Aliases: `thirdflare-one-gui` → same as `thirdflare`.

## Default behavior

Running `thirdflare` with no flags starts the **native tray + app shell** (embedded Web UI on KDE). Pass `--no-open` for API-only daemon mode.

## Environment

| Variable | Effect |
|----------|--------|
| `THIRDFLARE_WEBUI=1` | Serve static Web UI from daemon |
| `THIRDFLARE_PORT` | HTTP port (default `4173`; launcher scans +30 if busy) |
| `THIRDFLARE_WARP_CLI` | Path to warp-cli binary |
| `THIRDFLARE_CONFIG` | Override config file path |

Full list: [Configuration → Environment](/configuration/env).

## Next steps

- [thirdflare reference](/cli/thirdflare)
- [thirdflare-one operator](/cli/operator)
- [Tray](/cli/tray)
- [Helper scripts](/cli/helpers)
