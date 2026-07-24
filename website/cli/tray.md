# Tray CLI

Native system tray powered by PyQt6 and Qt WebEngine.

## Usage

```
thirdflare-one-tray            Start tray + native app shell
thirdflare-one-tray --panel    Show app window (starts tray if needed)
thirdflare-one-tray --stop      Stop tray process
thirdflare-one-tray --check     Tray readiness (exit 0 when OK)
thirdflare-one-tray --status     WARP status + notification when available
thirdflare-one-tray --help       Show help
```

Equivalent: `thirdflare --tray` or default `thirdflare`.

## KDE / Wayland

Uses **StatusNotifierItem** (not legacy XEmbed). Requires:

```bash
pip install PyQt6 PyQt6-WebEngine
thirdflare-one-tray --check
```

## Tooltip

Multi-line tooltip shows connection state, mode, and account hints — updated on poll from daemon API.

## API-only vs tray

| Mode | Command |
|------|---------|
| Tray + panel | `thirdflare` |
| Daemon only | `thirdflare --no-open` |
| Show panel | `thirdflare --panel` |

The tray subprocess manages its own lifecycle; stopping the daemon does not always stop the tray — use `--stop` on the relevant command.
