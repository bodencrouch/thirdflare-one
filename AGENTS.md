# Repository Guidelines

## Project

**ThirdFlare** — unofficial third-party Cloudflare One client (`thirdflare` npm package). Wraps host `warp-cli` through a Node daemon and optional Web UI. Repository folder name may still read `cloudflare-one-gui-linux` on GitHub until renamed.

## Project Structure

- `server.js` — HTTP API and guarded `warp-cli` execution.
- `lib/config.mjs` — layered configuration (system, user, env, session).
- `config/config.example.json` — documented defaults.
- `public/` — optional Web UI (off by default for systemd daemon).
- `bin/thirdflare` — primary launcher (`bin/cloudflare-one-gui` legacy alias).
- `packaging/` — FHS staging, nfpm, AppImage, Flatpak, Snap, systemd units.
- `docs/CONFIGURATION.md`, `docs/ARCHITECTURE.md`, `docs/PACKAGING.md`.

## Commands

- `npm run dev` — server with `THIRDFLARE_WEBUI=1`.
- `npm run check` — syntax including `lib/config.mjs`.
- `npm run test:integration` — mock warp-cli integration tests.
- `./bin/thirdflare` / `./bin/thirdflare --no-open` — launcher.
- `npm run package:*` — see `docs/PACKAGING.md`.

## Conventions

2-space indent; `camelCase` in JS; `kebab-case` for filenames. Conventional Commits for release-please.

## Testing

Run `npm run check` and `npm run test:integration` before handoff. After packaging changes: `npm run package:stage` and `npm run package:deb`.
