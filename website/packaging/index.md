# Packaging

Build matrix and FHS layout for ThirdFlare One artifacts.

## Operator builds

```bash
./thirdflare-one build appimage
./thirdflare-one build deb
./thirdflare-one build rpm
./thirdflare-one build flatpak
./thirdflare-one build snap
./thirdflare-one build all
```

npm aliases: `npm run package:stage`, `npm run package:deb`, etc.

## Staging

`packaging/scripts/stage-payload.sh` copies server, lib, public, bin, and config into FHS paths for nfpm/AppImage.

## Contents

| Artifact | Notes |
|----------|-------|
| **AppImage** | Portable Linux, update apply target |
| **deb/rpm** | nfpm + postinstall systemd/desktop |
| **Flatpak** | `packaging/flatpak/` manifest |
| **Snap** | strict confinement |
| **Docker** | GHCR images for headless API |

## systemd

User and system units under `packaging/systemd/`. Postinstall enables desktop integration.

## NetworkManager

Dispatcher and VPN name stub ship in deb/rpm/AppImage when staged:

- `packaging/networkmanager/99-thirdflare-warp`
- `packaging/networkmanager/nm-thirdflare-warp-service.name`

## Maintainer docs

Full detail in repository [PACKAGING.md](https://github.com/bodencrouch/thirdflare-one/blob/main/docs/PACKAGING.md) and [DISTRIBUTION.md](https://github.com/bodencrouch/thirdflare-one/blob/main/docs/DISTRIBUTION.md).

## CI

Plane M validates mock warp-cli on Linux/macOS/Windows. Plane R optional real WARP smoke on Ubuntu — [CI.md](https://github.com/bodencrouch/thirdflare-one/blob/main/docs/CI.md).
