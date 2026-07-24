# thirdflare

Primary launcher for ThirdFlare One.

## Usage

```
thirdflare                    Start native tray + app shell
thirdflare --no-open          Start/reuse API daemon (no shell)
thirdflare --status           Print daemon status
thirdflare --stop             Stop managed daemon
thirdflare --version          Print version
thirdflare --help             Show help
```

## WARP actions

```
thirdflare --connect            warp-cli connect + open UI
thirdflare --disconnect         warp-cli disconnect + open UI
thirdflare --toggle             Connect if down, else disconnect
thirdflare --warp-status        Print warp-cli status
thirdflare --warp-action <act>  Connect/disconnect via API (no browser)
```

## Native shell

```
thirdflare --tray               Start tray (same as default)
thirdflare --panel              Show native app window
```

On KDE Plasma / Wayland, left-click the tray icon opens the PyQt6 panel with the full Web UI.

## Examples

```bash
# Headless automation host
thirdflare --no-open
curl -s http://127.0.0.1:3847/api/status | jq

# Quick connect from terminal
thirdflare --connect

# Check daemon
thirdflare --status
thirdflare --stop
```

## Aliases

- `thirdflare-one` (when invoked as GUI launcher from some installs)
- `thirdflare-one-gui`
