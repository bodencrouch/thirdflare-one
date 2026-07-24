# thirdflare-one operator

Build, install, and test entrypoint — comparable to `podman` system commands or a project `./thirdflare-one` wrapper.

## Usage

```
thirdflare-one install [--service]   User install to ~/.local/share/thirdflare-one
thirdflare-one uninstall [--purge]   Remove install
thirdflare-one run [args...]         Launch GUI (bin/thirdflare)
thirdflare-one build <target>        Package builds
thirdflare-one dev                   Dev server + Web UI
thirdflare-one check                 Syntax check
thirdflare-one test [suite]          Test suites
thirdflare-one version               Print version
thirdflare-one help                  Show help
```

## Install

```bash
./thirdflare-one install
./thirdflare-one install --service   # systemd user unit
```

## Build targets

```bash
./thirdflare-one build appimage
./thirdflare-one build deb
./thirdflare-one build rpm
./thirdflare-one build arch
./thirdflare-one build flatpak
./thirdflare-one build snap
./thirdflare-one build source
./thirdflare-one build all
```

## Development

```bash
./thirdflare-one dev        # npm run dev
./thirdflare-one check      # npm run check
./thirdflare-one test all   # Plane M mock tests
./thirdflare-one test ui    # Playwright smoke
```

## Test suites

| Suite | Command |
|-------|---------|
| All (no Playwright) | `test all` |
| Integration | `test integration` |
| OpenAPI | `test openapi` |
| Kill switch | `test killswitch` |
| Updates | `test update` |
| Real WARP (optional) | `test warp:real` |

See [Contributing](/contributing/) for CI planes (Plane M vs Plane R).
