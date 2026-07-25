# Troubleshooting

## Daemon won't start

```bash
thirdflare --status
thirdflare --stop && thirdflare --no-open
```

Check warp-cli daemon:

```bash
warp-cli status
```

## Web UI blank or 404

The daemon may be in **API-only** mode (`webui.enabled=false`). Enable Web UI and restart:

```bash
thirdflare-one-tray --settings
# or
THIRDFLARE_WEBUI=1 thirdflare --daemon
```

When Web UI is enabled, static assets are always served. API-only mode returns 404 for `/app.js` and other UI paths.

## Tray missing (KDE)

```bash
pip install PyQt6 PyQt6-WebEngine
thirdflare-one-tray --check
```

Log out/in after first `.desktop` install. Confirm StatusNotifierItem is enabled in Plasma.

## Stale UI / log dock wrong place

Purge reinstall:

```bash
./thirdflare-one uninstall --purge
./thirdflare-one install
npm run verify:install
```

Service worker cache version bumps on release — hard refresh if needed.

## Kill switch / polkit

Applying nftables rules needs elevation. If pkexec fails, run from a polkit-enabled session or disable kill switch before debugging network.

## NetworkManager access denied

`nmcli connection load` may fail for system keyfiles. Use KDE **Import VPN connection** — see [KDE / NetworkManager](/guides/networkmanager).

## OpenAPI / port confusion

Example config and launcher both default to port **4173**. Read `/api/config` if health checks fail — the daemon may have taken the next free port.

## Tests

```bash
npm run check
npm run test:all
```

Report issues: [GitHub Issues](https://github.com/bodencrouch/thirdflare-one/issues).
