# Distribution channels

ThirdFlare One ships through several channels. See [DISTRIBUTION](https://github.com/bodencrouch/thirdflare-one/blob/main/docs/DISTRIBUTION.md) in the repo for maintainer details.

## Build from source

```bash
./thirdflare-one build appimage   # single-file Linux binary
./thirdflare-one build deb
./thirdflare-one build rpm
./thirdflare-one build flatpak
./thirdflare-one build snap
./thirdflare-one build all          # staged artifacts under packaging/dist/
```

## Channels

| Channel | Notes |
|---------|-------|
| **GitHub Releases** | AppImage and source tarballs |
| **AppImageHub** | Community AppImage index |
| **Flathub** | Flatpak (sandboxed) |
| **Snap Store** | Strict confinement |
| **COPR / AUR** | RPM and Arch packaging (see docs) |
| **Homebrew** | `homebrew-tap` branch — tap formula |
| **GHCR Docker** | Container images for headless/API use |

## npm package

The repo publishes the `thirdflare` npm package name for programmatic installs; primary UX remains the native CLI launchers above.

## WARP prerequisite

Every channel assumes **warp-cli** is installed and registered on the host. ThirdFlare One does not bundle the Cloudflare daemon.
