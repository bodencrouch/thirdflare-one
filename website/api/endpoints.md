# API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness (`ok`, `app`, `version`) |
| GET | `/api/version` | Installed version + update source |
| GET | `/api/account` | Structured registration / devices |
| GET | `/api/snapshot` | Aggregated warp-cli reads (see keys below) |
| GET | `/api/config` | Effective layered config + sources |
| POST | `/api/config/session` | Session overrides (until daemon restart) |
| POST | `/api/config/tray-autostart` | Tray autostart preference |
| POST | `/api/config/webui` | Persist Web UI enablement (restart required) |
| POST | `/api/config/server` | Persist HTTP port/bind (restart required) |
| POST | `/api/config/ui` | Persist UI preferences (notifications) |
| GET | `/api/killswitch` | Kill switch desired/active state |
| POST | `/api/killswitch` | Enable/disable kill switch |
| POST | `/api/killswitch/enrollment-pause` | Pause KS during enrollment |
| GET | `/api/update/check` | Check for client updates |
| GET | `/api/update/releases` | List releases for source |
| GET | `/api/update/forks` | Fork list for update source UI |
| POST | `/api/update/source` | Set update GitHub source |
| POST | `/api/update/prepare` | Stage update download |
| POST | `/api/update/apply` | Apply staged update (AppImage) |
| GET | `/api/events` | SSE stream of warp-cli live output |
| GET | `/api/logs` | In-memory command log (`?since=timestamp`) |
| GET | `/api/apps` | Desktop apps for proxy launcher |
| POST | `/api/apps/proxy-launcher` | Create `.desktop` proxy shortcut |
| POST | `/api/action` | Whitelisted warp-cli mutation |

## Snapshot command keys

The `commands` object in `/api/snapshot` includes keys from `COMMANDS` in `server.js`, for example:

`status`, `settings`, `registration`, `organization`, `devices`, `stats`, `tunnelStats`, `dnsStats`, `splitTunnelDump`, `splitTunnelIps`, `splitTunnelHosts`, `targets`, `vnet`, `mdm`, `override`, `localNetworkOverride`, `trustedSsids`, `posture`, `network`, `certs`, and more.

Each value is `{ ok, command, code, stdout, stderr, durationMs }` with redacted secrets.

## Static UI

When `webui.enabled` is true, non-API paths serve `public/` (SPA fallback to `index.html`).

When disabled, non-API routes return **503** with a plain-text explanation.
