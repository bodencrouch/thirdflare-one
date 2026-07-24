# User install

The operator command `./thirdflare-one install` is idempotent. Re-running updates the staged tree and refreshes symlinks.

## Layout

| Path | Contents |
|------|----------|
| `~/.local/share/thirdflare-one/` | Application tree (server, public, lib, bin) |
| `~/.local/bin/thirdflare` | Launcher symlink |
| `~/.local/bin/thirdflare-one` | Operator symlink |
| `~/.local/bin/thirdflare-one-tray` | Tray binary |
| `~/.config/thirdflare-one/` | User config (optional) |
| `~/.local/share/applications/thirdflare-one.desktop` | Desktop entry |

## Options

```bash
./thirdflare-one install              # user install
./thirdflare-one install --service    # also install systemd user unit (Linux)
./thirdflare-one uninstall            # remove symlinks and desktop file
./thirdflare-one uninstall --purge    # also remove install tree and config
```

## systemd user daemon

With `--service`, a user unit starts the daemon at login (API-only by default). Enable Web UI in config or environment if needed.

```bash
systemctl --user enable --now thirdflare-one.service
systemctl --user status thirdflare-one.service
```

## Important

The **tray reads the installed tree**, not your git workspace. After changing code in a checkout, reinstall or run from `./bin/thirdflare` in the repo for development.
