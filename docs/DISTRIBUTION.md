# Distribution channels

Where to install ThirdFlare One and how each channel is published from this repository.

> **Not affiliated with Cloudflare.** Install [Cloudflare WARP](https://developers.cloudflare.com/warp-client/get-started/linux/) separately on every platform.

## Quick install by channel

| Channel | Install command | Discoverability |
|---------|-----------------|-----------------|
| **GitHub Releases** | Download artifact from [Releases](https://github.com/bodencrouch/thirdflare-one/releases) | Always available |
| **Flathub** | `flatpak install flathub io.github.bodencrouch.ThirdFlareOne` | After Flathub PR merge |
| **Snap Store** | `snap install thirdflare-one --classic` | After store upload + classic review |
| **Fedora COPR** | `dnf copr enable bodencrouch/thirdflare-one && dnf install thirdflare-one` | After Packit/COPR build |
| **Homebrew (macOS)** | `brew tap bodencrouch/thirdflare-one homebrew-tap && brew install thirdflare-one` | Automated on release |
| **AppImageHub** | Listed at [appimage.github.io](https://appimage.github.io/) | After listing PR merge |
| **Arch AUR** | `yay -S thirdflare-one` | After AUR package publish |
| **User install (any Linux)** | `./thirdflare-one install` from a clone | Manual |

### GitHub Releases (direct download)

```bash
# AppImage (x86_64, bundles Node)
chmod +x thirdflare-VERSION-x86_64.AppImage
./thirdflare-VERSION-x86_64.AppImage

# Debian / Ubuntu
sudo dpkg -i thirdflare_VERSION_all.deb

# Fedora / RHEL (from release asset)
sudo rpm -Uvh thirdflare-VERSION-1.noarch.rpm
```

### Flathub

```bash
flatpak install flathub io.github.bodencrouch.ThirdFlareOne
thirdflare-one
```

Manifest for submission: [`packaging/flathub/io.github.bodencrouch.ThirdFlareOne.yml`](../packaging/flathub/io.github.bodencrouch.ThirdFlareOne.yml)

**Migration:** Older sideloaded `.flatpak` bundles used app ID `io.github.cloudflare_one_gui_linux.CloudflareOneGui`. Flathub and new builds use `io.github.bodencrouch.ThirdFlareOne`.

### Snap Store

```bash
snap install thirdflare-one --classic
```

Classic confinement is required so the snap can reach the host `warp-cli` and WARP daemon. Justification: [`packaging/snap/CLASSIC_JUSTIFICATION.md`](../packaging/snap/CLASSIC_JUSTIFICATION.md)

### Fedora COPR

```bash
sudo dnf copr enable bodencrouch/thirdflare-one
sudo dnf install thirdflare-one
```

Builds are triggered from release tags via [Packit](https://packit.dev) (see [`.packit.yaml`](../.packit.yaml)).

### Homebrew (macOS)

```bash
brew tap bodencrouch/thirdflare-one homebrew-tap
brew install thirdflare-one
thirdflare-one --no-open
```

Requires [Cloudflare WARP for macOS](https://developers.cloudflare.com/warp-client/get-started/macos/).

### AppImageHub

After listing merge, AppImageHub points to the latest GitHub Release AppImage URL pattern:

`https://github.com/bodencrouch/thirdflare-one/releases/download/vVERSION/thirdflare-VERSION-x86_64.AppImage`

Listing template: [`packaging/appimagehub/thirdflare-one.yml`](../packaging/appimagehub/thirdflare-one.yml)

### Arch AUR

```bash
yay -S thirdflare-one
# or
git clone https://aur.archlinux.org/thirdflare-one.git && cd thirdflare-one && makepkg -si
```

PKGBUILD template: [`packaging/aur/PKGBUILD`](../packaging/aur/PKGBUILD)

---

## Platform coverage

| Platform | Native bundle | Install path today |
|----------|---------------|-------------------|
| **Linux** | Primary target | Flathub, Snap, COPR, AppImage, deb, rpm, AUR, GitHub Releases |
| **macOS** | No `.app` yet | Homebrew tap (CLI + browser Web UI) |
| **Windows** | No `.exe` yet | Not packaged — official Cloudflare One client exists; CI runs mock tests only |

A future **Tauri** shell could ship `.exe` / `.app` bundles wrapping the same localhost API; that is tracked separately from store publishing.

---

## Maintainer automation

Release flow:

1. Tag + GitHub Release (Release Please or `gh release create`)
2. [`package.yml`](../.github/workflows/package.yml) builds artifacts and uploads to the release
3. [`publish-stores.yml`](../.github/workflows/publish-stores.yml) publishes to stores when secrets are configured

| Secret | Enables |
|--------|---------|
| `SNAPCRAFT_STORE_CREDENTIALS` | Snap Store upload |
| `COPR_API_TOKEN` | Manual COPR trigger from CI (Packit uses its own integration) |
| `AUR_SSH_PRIVATE_KEY` | AUR package push via [`scripts/publish-aur.sh`](../scripts/publish-aur.sh) |
| `FLATHUB_PAT` | Optional PR to flathub/flathub via [`scripts/publish-flathub-pr.sh`](../scripts/publish-flathub-pr.sh) |
| `GH_PAT` | Optional AppImageHub listing PR via [`scripts/publish-appimagehub-pr.sh`](../scripts/publish-appimagehub-pr.sh) |

### One-time setup checklist

- [ ] Merge Flathub PR at [github.com/flathub/flathub](https://github.com/flathub/flathub) using manifest in `packaging/flathub/`
- [ ] Register `thirdflare-one` on Snap Store; export login → `SNAPCRAFT_STORE_CREDENTIALS`
- [ ] Enable Packit on the repo for COPR project `bodencrouch/thirdflare-one`
- [ ] Create AUR package `thirdflare-one` (manual or CI with `AUR_SSH_PRIVATE_KEY`)
- [ ] Open AppImageHub PR using `packaging/appimagehub/thirdflare-one.yml`

See also [PACKAGING.md](PACKAGING.md) and [UPDATES.md](UPDATES.md).
