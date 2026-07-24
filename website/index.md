---
layout: home

hero:
  name: ThirdFlare One
  text: Cloudflare One, your way
  tagline: Unofficial third-party client for warp-cli — native tray, guarded HTTP API, optional Web UI, kill switch, and Linux packaging. CLI-first like Render or Cursor; install paths like Podman.
  actions:
    - theme: brand
      text: Install
      link: /install/
    - theme: alt
      text: CLI reference
      link: /cli/
    - theme: alt
      text: GitHub
      link: https://github.com/bodencrouch/thirdflare-one

features:
  - icon: 🚀
    title: CLI & operator entrypoint
    details: thirdflare for daily use, thirdflare-one for install/build/test — same patterns as Tavily CLI and Firecrawl CLI docs.
  - icon: 🛡️
    title: Guarded warp-cli bridge
    details: HTTP API whitelists safe warp-cli reads and actions. No arbitrary shell passthrough.
  - icon: 🖥️
    title: Native shell on KDE
    details: PyQt6 tray embeds the full Web UI on Plasma/Wayland. API-only daemon when you pass --no-open.
  - icon: 📦
    title: Real packaging
    details: AppImage, deb, rpm, Flatpak, Snap, Homebrew tap, and systemd units — documented end to end.
  - icon: 🔒
    title: Kill switch
    details: nftables rules via pkexec when enabled — block leaks if WARP drops.
  - icon: 🌐
    title: KDE / NetworkManager
    details: Import MASQUE, WireGuard, and local-proxy profiles; sync from daemon settings.
---

## Quick start

```bash
git clone https://github.com/bodencrouch/thirdflare-one.git
cd thirdflare-one
./thirdflare-one install
thirdflare
```

Left-click the tray icon on KDE to open the native panel. For API-only mode:

```bash
thirdflare --no-open
curl -s http://127.0.0.1:3847/api/health | jq
```

## What this project offers

| Surface | Purpose |
|---------|---------|
| **thirdflare** | Launcher — tray, connect/disconnect, daemon lifecycle |
| **thirdflare-one** | Operator — install, packages, dev server, tests |
| **HTTP API** | Automation — status, settings, killswitch, updates |
| **Web UI** | Optional in-browser control (on with `THIRDFLARE_WEBUI=1`) |
| **Tray (PyQt6)** | Native KDE/Wayland shell with embedded UI |

See [Architecture](/guides/) and the [API reference](/api/) for the full map.
