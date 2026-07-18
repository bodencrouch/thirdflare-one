---
title: Persist kill switch desired state
status: completed
date: 2026-07-17
---

# Persist kill switch — requirements

## Problem

Successful `POST /api/killswitch` only updates in-memory session overrides. After daemon restart, desired state falls back to file/env defaults (`false`), while nftables rules can remain — orphans and false UI “off” after review findings ADV-KS-003.

## Decision

When kill switch apply **succeeds**, write `warp.killSwitch` and `warp.killSwitchAllowLan` to the **user** config file (`~/.config/thirdflare/config.json`), then reload effective config. Do not persist on failed apply. Keep session updates only as an in-process mirror (or clear after reload).

## Non-goals

- Writing system `/etc/thirdflare/config.json` from the unprivileged daemon
- Generic “persist all session UI settings” framework
- Kill switch + Zero Trust enroll exceptions (separate slice)

## Success criteria

- Enable → restart daemon → `getConfig().warp.killSwitch === true` and startup reconcile attempts enable
- Disable → restart → desired false; orphan cleanup still uses privileged probe when possible
- Failed apply leaves user config unchanged
- Unit tests cover merge/write with temp HOME; docs note persistence
