# Environment variables

Environment overrides map in `lib/config.mjs`:

| Variable | Effect |
|----------|--------|
| `THIRDFLARE_PORT` | Server port (aliases: `CLOUDFLARE_ONE_GUI_PORT`, `PORT`) |
| `THIRDFLARE_BIND` | Bind address (alias: `CLOUDFLARE_ONE_GUI_BIND`) |
| `THIRDFLARE_WARP_CLI` | warp-cli path (alias: `WARP_CLI`) |
| `THIRDFLARE_WEBUI` | `1`/`true` enable UI; `0`/`false` disable |
| `THIRDFLARE_WEBUI_ALLOW_REMOTE` | Allow remote UI access |
| `THIRDFLARE_LOCALE` | UI locale |
| `THIRDFLARE_NOTIFICATIONS` | Enable/disable notifications |
| `THIRDFLARE_UPDATE_CHANNEL` | Update channel |
| `THIRDFLARE_UPDATE_SOURCE` | `owner/repo` update source |
| `THIRDFLARE_UPDATE_CHECK` | `0`/`false` skip startup check |
| `THIRDFLARE_CONFIG` | Explicit config file path |

## Development

```bash
export THIRDFLARE_WEBUI=1
npm run dev
```

## systemd drop-in

```ini
[Service]
Environment=THIRDFLARE_WEBUI=0
Environment=THIRDFLARE_PORT=3847
```

## Config file paths

Resolved by `configPaths()`:

- System: `/etc/thirdflare-one/config.json`
- User: `~/.config/thirdflare-one/config.json`

Override with `THIRDFLARE_CONFIG` for testing.
