# Contributing

Thank you for improving **ThirdFlare One**.

## Setup

```bash
git clone https://github.com/bodencrouch/thirdflare-one.git
cd thirdflare-one
npm install
npm run check
npm run test:all
```

## Conventions

- 2-space indent, `camelCase` in JS, `kebab-case` filenames
- [Conventional Commits](https://www.conventionalcommits.org/) for release-please
- Product name **ThirdFlare One** in user-facing strings
- Plain language in UI — no planning/prompt copy

## Test planes

| Plane | Scope |
|-------|-------|
| **M** | Mock warp-cli — required CI on Linux/macOS/Windows |
| **R** | Real WARP smoke — optional Ubuntu |

See [CI.md](https://github.com/bodencrouch/thirdflare-one/blob/main/docs/CI.md).

## Before handoff

```bash
npm run check
npm run test:all
```

After API changes, smoke `/api/health`, `/api/version`, `/api/account`, `/api/killswitch`, `/api/update/check`.

## Docs

- Repository markdown: `docs/`
- Published site: this VitePress site (`website/`)
- Update both when behavior changes

Full guide: [CONTRIBUTING.md](https://github.com/bodencrouch/thirdflare-one/blob/main/docs/CONTRIBUTING.md).
