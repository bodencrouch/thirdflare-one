# Desktop app and tray

ThirdFlare One can use **Cloudflare One Client** (the tray that comes with WARP) or **ThirdFlare One** (this project’s PyQt6 tray with the Web UI embedded). Default is Cloudflare One Client. Only one tray runs at a time.

## Choose the desktop app

Settings → **Desktop app**, or at install:

```bash
./thirdflare-one install --shell cloudflare   # default
./thirdflare-one install --shell thirdflare
```

## Start

```bash
thirdflare                    # selected desktop app
thirdflare --tray             # ThirdFlare One tray
thirdflare-one-tray --check
```

When ThirdFlare One is selected, left-click the tray icon opens the control panel.

## vs API-only

| | Desktop app | `--no-open` |
|---|------|-------------|
| Tray | Cloudflare One Client or ThirdFlare One | None |
| Web UI | Embedded in the ThirdFlare One tray | Optional browser |
| Notifications | Tray + libnotify | API only |
| Use case | Desktop daily driver | Automation, servers |

## Stop

```bash
thirdflare-one-tray --stop
thirdflare --stop    # daemon (tray may need a separate stop)
```

`--stop` on the tray command stops the **active** desktop app (including Cloudflare One Client when that is selected). Uninstall does not remove WARP.

## Packaging note

ThirdFlare One launches the host WARP desktop app; it does not bundle it. PyQt6 is a runtime dependency only when you use the ThirdFlare One tray.
