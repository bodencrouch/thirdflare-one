---
title: Persist kill switch to user config
status: completed
date: 2026-07-17
origin: docs/brainstorms/2026-07-17-persist-killswitch-requirements.md
---

# Plan: Persist kill switch

### Delta Update
- Landed: `persistUserKillSwitch`, HOME-aware `configPaths`, API persist-on-success, tests, CONFIGURATION docs
- Partial: none
- Next: Zero Trust enroll-while-KS (separate slice)

## Approach

Add a narrow user-config writer in `lib/config.mjs` that merges only `warp.killSwitch` / `warp.killSwitchAllowLan` into `~/.config/thirdflare/config.json`, then `reloadConfig()`. Call it from `POST /api/killswitch` **after** successful `applyKillSwitch`. On failure, leave disk and session as today (rollback session to previous).

## Files

- `lib/config.mjs` — `persistUserKillSwitch`
- `server.js` — call persist on success
- `scripts/ci-killswitch.test.mjs` or `scripts/ci-config.test.mjs` — temp HOME write/merge tests
- `docs/CONFIGURATION.md` — document persistence behavior

## Test scenarios

1. Persist creates user file with both booleans when missing
2. Persist merges without clobbering unrelated user keys (`ui.locale`)
3. Non-boolean enabled is a no-op
4. Integration still: failed enable does not leave desired true (existing)

## Risks

- User layer overrides system for same keys (existing precedence) — document that UI toggle is per-user
