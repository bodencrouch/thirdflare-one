# Native tray (KDE)

ThirdFlare One ships a **PyQt6** tray that embeds the full Web UI — primary UX on KDE Plasma / Wayland.

## Dependencies

```bash
pip install PyQt6 PyQt6-WebEngine
thirdflare-one-tray --check
```

## Start

```bash
thirdflare
# or
thirdflare-one-tray
```

Left-click opens the native panel. Tooltip shows connection summary (multi-line).

## vs API-only

| | Tray | `--no-open` |
|---|------|-------------|
| Web UI | Embedded | Optional browser |
| Notifications | Tray + libnotify | API only |
| Use case | Desktop daily driver | Automation, servers |

## Stop

```bash
thirdflare-one-tray --stop
thirdflare --stop    # daemon (tray may need separate stop)
```

## Packaging note

First-class tray packaging across all channels is an ongoing goal; today PyQt6 is a runtime dependency on Linux desktop installs.
