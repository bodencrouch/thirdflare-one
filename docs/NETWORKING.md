# KDE Plasma and NetworkManager integration

ThirdFlare One integrates Cloudflare WARP with **NetworkManager** and **KDE Plasma** so you can connect from the same places as Wi‑Fi and other networks.

WARP is **not** a traditional OpenVPN/WireGuard file you paste into NetworkManager — the official client uses the **`CloudflareWARP`** tunnel interface and **`warp-cli`**. ThirdFlare ships ready-made profiles and hooks that call `warp-cli` for you.

Research note: the [warp-docker](https://github.com/cmj2002/warp-docker) project documents low-level WARP behaviour (TUN device, MASQUE vs WireGuard, local proxy on port 40000, policy routing). ThirdFlare follows those same `warp-cli` commands on native Linux.

## Profiles (MASQUE, WireGuard, local proxy)

| Profile | Protocol | Mode | Use when |
|---------|----------|------|----------|
| **ThirdFlare WARP (MASQUE)** | MASQUE (HTTP/3) | Full tunnel | Default; works on restrictive networks |
| **ThirdFlare WARP (WireGuard)** | WireGuard | Full tunnel | You prefer UDP WireGuard to the edge |
| **ThirdFlare WARP (Local proxy)** | MASQUE | Local proxy | Only apps using the proxy / WARP shortcuts use the tunnel |

Full-tunnel profiles bind to interface **`CloudflareWARP`** (created by `warp-svc` when connected). Local proxy listens on **`127.0.0.1:40000`** (SOCKS/HTTP).

## Install integration

After `./thirdflare-one install` or `./scripts/install-local.sh`:

```bash
# User profiles (~/.config/NetworkManager/system-connections/)
./scripts/thirdflare-nm --user

# Dispatcher + sysctl (recommended once; prompts for admin)
./scripts/thirdflare-nm --system
```

If `nmcli` reports **access denied** when loading profiles, open **System Settings → Network → + → Import VPN connection…** and choose a file from `~/.config/NetworkManager/system-connections/ThirdFlare-WARP-*.nmconnection`, then log out and back in (or restart NetworkManager) if they do not appear immediately.

Packaged `.deb` / `.rpm` installs include dispatcher, sysctl drop-in, and importable profiles under `/usr/share/thirdflare-one/networkmanager/profiles/`.

### Sysctl

WARP policy routing needs:

```ini
net.ipv4.conf.all.src_valid_mark=1
```

Installed to `/etc/sysctl.d/99-thirdflare-warp.conf` with `--system` or packages.

## Using KDE Plasma

1. **System Settings → Network** — connect **ThirdFlare WARP (MASQUE)**, **WireGuard**, or **Local proxy**.
2. **Import VPN connection…** (bottom of the “Add connection” dialog) — pick a file from:
   - `~/.config/NetworkManager/system-connections/ThirdFlare-WARP-*.nmconnection`
   - `/usr/share/thirdflare-one/networkmanager/profiles/` (packages)
3. **Plasma Networks widget** — configured WARP profiles appear alongside other connections.
4. **Local proxy mode** — ThirdFlare can sync **System Settings → Proxy** to `127.0.0.1:40000` when the local proxy profile is active.

Connecting from KDE runs `scripts/thirdflare-warp-connect`, which executes the same steps as the official client:

```bash
# MASQUE full tunnel
warp-cli tunnel protocol set MASQUE
warp-cli mode warp
warp-cli connect

# WireGuard full tunnel
warp-cli tunnel protocol set WireGuard
warp-cli mode warp
warp-cli connect

# Local proxy (MASQUE required)
warp-cli tunnel protocol set MASQUE
warp-cli mode proxy
warp-cli proxy port 40000
warp-cli connect
```

Disconnecting from KDE runs `warp-cli disconnect` and clears KDE proxy settings when applicable.

## ThirdFlare app ↔ NetworkManager sync

When you connect or disconnect from the ThirdFlare One UI, the daemon tries to activate or deactivate the matching NetworkManager profile (`nmcli`). Requires `nmcli` on `PATH`.

## Requirements

- **NetworkManager** (`nmcli`)
- **Cloudflare WARP** (`warp-cli`, `warp-svc`) on the host
- Linux (KDE Plasma, GNOME, etc.)
- For dispatcher hooks: write access to `/etc/NetworkManager/dispatcher.d/` (via `pkexec` or package install)

## Limitations

- WARP cannot appear as a native **WireGuard peer editor** in NetworkManager — Cloudflare owns keys and endpoints inside `warp-svc`.
- A full **NetworkManager VPN plugin** (`.so`) would be needed for a custom row in the “Add VPN” type list without import; ThirdFlare uses importable profiles + generic connections instead.
- Local proxy mode does not tunnel UDP; use full tunnel profiles when you need UDP through WARP.

See also [GETTING_STARTED.md](GETTING_STARTED.md) and [CONFIGURATION.md](CONFIGURATION.md).
