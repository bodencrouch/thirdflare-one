# Architecture

## Problem

Cloudflare ships a full **Cloudflare One** desktop client on Windows. Other platforms expose **`warp-cli`** and background daemons but no equivalent GUI. ThirdFlare One reimplements that control surface as a local HTTP API + optional Web UI, targeting **functional parity** and **drop-in compatibility** with existing WARP installs.

## High-level diagram

```mermaid
flowchart LR
  subgraph host [Host OS]
    WARP[CloudflareWARP daemon]
    CLI[warp-cli]
    WARP --> CLI
  end

  subgraph thirdflare [ThirdFlare One]
    SRV[Node server.js]
    CFG[lib/config.mjs]
    UI[Static Web UI]
    CFG --> SRV
    SRV --> UI
    SRV -->|spawn| CLI
  end

  Browser[Browser / tray / scripts] -->|HTTP localhost| SRV
```

## Components

| Path | Role |
|------|------|
| `server.js` | HTTP server, `/api/*`, guarded `warp-cli` execution |
| `lib/config.mjs` | Layered configuration merge + session overrides |
| `public/` | Web UI (PWA-capable), optional when `webui.enabled=false` |
| `bin/thirdflare` | Launcher: port selection, daemon lifecycle, browser open |
| `bin/thirdflare-tray` | PyQt6 native shell (KDE/Wayland) + SNI/yad fallbacks; loads `/?shell=1` simple UI |
| `scripts/tray-qt.py` | Embedded WebEngine window + system tray |
| `scripts/thirdflare-nft-apply` | Polkit-scoped privileged helper for kill-switch nft apply |
| `lib/tray/autostart.mjs` | XDG autostart desktop entry sync (`tray.autostart`) |
| `lib/warp/status.mjs` | Shared `warp-cli` status parsing |
| `lib/notify/` | Desktop notifications (`notify-send`) + status watcher |
| `scripts/health-check.mjs` | Used by launcher and CI to verify `/api/health` |

## Desktop notifications

When `ui.notifications` is true (default), `server.js` starts `lib/notify/status-watcher.mjs` on listen — independent of the Web UI or SSE clients. The watcher runs `warp-cli --listen status`, shares `parseStatus` from `lib/warp/status.mjs`, and calls `notify-send` (libnotify) only on meaningful transitions (connect / disconnect / daemon lost / unhealthy), debounced ~1.5s. Requires `notify-send` on `PATH`; disable with `ui.notifications: false` or `THIRDFLARE_DISABLE_NOTIFICATIONS=1`.

## API surface

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | Liveness; returns `app: "thirdflare"` |
| `/api/version` | GET | Installed semver, channel, update source |
| `/api/config` | GET | Effective config + source flags |
| `/api/config/session` | POST | Provisional in-app overrides |
| `/api/account` | GET | Structured registration / account DTO |
| `/api/snapshot` | GET | Aggregated `warp-cli` command output |
| `/api/events` | GET | SSE stream from `warp-cli --listen status` |
| `/api/action` | POST | Whitelisted mutations (`connect`, `setMode`, …) |
| `/api/config/tray-autostart` | POST | Persist tray XDG autostart preference (Linux) |
| `/api/killswitch` | GET/POST | nftables kill-switch desired/active (Linux) |
| `/api/killswitch/enrollment-pause` | POST | Pause/resume KS around Zero Trust enrollment |
| `/api/update/check` | GET | Channel/manifest/GitHub update check |
| `/api/update/forks` | GET | Allowed update sources |
| `/api/update/releases` | GET | Release list for owner/repo |
| `/api/update/source` | POST | Session override for update source |
| `/api/update/prepare` | POST | Download/verify prepare token |
| `/api/update/apply` | POST | Apply prepared AppImage update |

Contract file: [`openapi/thirdflare-api.json`](../openapi/thirdflare-api.json). Secrets in command output are redacted before JSON serialization.

## Always On (Linux)

Windows Cloudflare One exposes **Always On** in the client. Linux `warp-cli` has no public equivalent. ThirdFlare implements **Always On (kill switch)** via nftables table `inet thirdflare_killswitch`:

1. User toggles desired state → `POST /api/killswitch`
2. `lib/killswitch/apply.mjs` writes a validated rules script and runs `pkexec thirdflare-nft-apply apply <file>` (or unprivileged `nft -f` when permitted)
3. Polkit policy `com.thirdflare.one.nft-apply` scopes elevation to `/usr/lib/thirdflare/scripts/thirdflare-nft-apply`
4. GET `/api/killswitch` probes with read-only `nft list` — never escalates privilege
5. Zero Trust enrollment can pause rules via `lib/killswitch/enroll-pause.mjs` without clearing persisted desired state

## Configuration flow

1. **Boot** — `reloadConfig()` merges layers (see [CONFIGURATION.md](CONFIGURATION.md)).
2. **Listen** — `effectiveBind()` returns `127.0.0.1` unless `webui.enabled && webui.allowRemote`.
3. **Runtime** — Session overrides mutate an in-memory layer; GET `/api/config` reflects changes immediately for keys that do not require restart.
4. **WARP** — `warp.cli` selects binary; Flatpak sets `FLATPAK_ID` and uses `flatpak-spawn --host`.

## Platform matrix

| Platform | Daemon | Web UI | WARP CLI |
|----------|--------|--------|----------|
| Linux native | systemd user service or launcher | Optional | Host `warp-cli` |
| Linux Flatpak | same | Optional | `flatpak-spawn --host warp-cli` |
| Linux Snap (classic) | same | Optional | Host `warp-cli` |
| macOS Homebrew | manual / future launchd | Optional | Homebrew + Cloudflare WARP |
| Container (GHCR) | `node server.js` | Off by default | Mount host binary |

## Security model (v1)

- Binds to loopback unless explicitly configured for remote Web UI.
- No shell when invoking `warp-cli`; argument allow-lists for `/api/action`.
- Destructive operations require GUI confirmation.
- **Gap:** `/api/action` has no CSRF token yet — acceptable only on trusted localhost; do not expose remotely without adding auth.

## Packaging layout (FHS)

```
/usr/bin/thirdflare
/usr/bin/thirdflare-one
/usr/bin/thirdflare-one-tray
/usr/lib/thirdflare/server.js
/usr/lib/thirdflare/scripts/tray-qt.py
/usr/lib/thirdflare/scripts/thirdflare-nft-apply
/usr/share/polkit-1/actions/com.thirdflare.one.policy
/usr/lib/thirdflare/public/
/etc/default/thirdflare
/etc/thirdflare/config.json.example
/usr/lib/systemd/user/thirdflare-one.service
```

## Testing

- `npm run check` — syntax
- `npm run test:all` — Plane M (mock CLI, OpenAPI shapes, units)
- `npm run test:ui` — Playwright against mock daemon
- `npm run test:warp:real` — Plane R (optional Linux)
- CI package smoke — deb/rpm on Ubuntu

See [CI.md](CI.md) for confidence levels and [PACKAGING.md](PACKAGING.md) for release mechanics.

## Parity strategy

ThirdFlare One maps Windows Cloudflare One workflows to `warp-cli` surfaces in the Web UI (expert mode) and a simplified native shell (Connectivity, Profile, etc.). New surfaces should:

1. Add read commands to `COMMANDS` in `server.js`.
2. Add guarded actions to `ACTIONS` / `actionArgs`.
3. Extend `public/app.js` views.
4. Document behavior in CHANGELOG.

Native PyQt6 shell embeds the same HTTP API (`/?shell=1` simple layout, expert toggle). Tauri/Electron remain optional follow-ups.
