# Quick install

From a git checkout:

```bash
./thirdflare-one install
```

This runs `scripts/install-local.sh` and installs to `~/.local/share/thirdflare-one`, symlinks `thirdflare` / `thirdflare-one` into `~/.local/bin`, and adds a `.desktop` entry.

Ensure `~/.local/bin` is on your `PATH`, then:

```bash
thirdflare --version
thirdflare --check   # tray readiness (PyQt6)
thirdflare
```

## Development without install

```bash
npm install
npm run dev          # THIRDFLARE_WEBUI=1, hot daemon from repo root
./bin/thirdflare --no-open
```

Open `http://127.0.0.1:3847` when Web UI is enabled.

## Reinstall / purge

To reset WebEngine cache and stale daemon state:

```bash
./thirdflare-one uninstall --purge
./thirdflare-one install
npm run verify:install
```

See [Verify install](/install/verify) for what the verify script checks.
