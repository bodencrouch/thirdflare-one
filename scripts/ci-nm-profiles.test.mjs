import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allProfileKeyfiles,
  buildNmKeyfile,
  profileBySlug,
  PROFILE_IDS,
  WARP_PROFILES
} from "../lib/networkmanager/profiles.mjs";

test("WARP profiles cover MASQUE, WireGuard, and local proxy", () => {
  assert.equal(WARP_PROFILES.length, 3);
  assert.ok(profileBySlug("masque"));
  assert.ok(profileBySlug("wireguard"));
  assert.ok(profileBySlug("proxy"));
});

test("buildNmKeyfile uses generic CloudflareWARP binding", () => {
  const keyfile = buildNmKeyfile(profileBySlug("masque"));
  assert.match(keyfile, /type=generic/);
  assert.match(keyfile, /interface-name=CloudflareWARP/);
  assert.match(keyfile, /type=generic/);
});

test("WireGuard profile sets WireGuard protocol", () => {
  const profile = profileBySlug("wireguard");
  const keyfile = buildNmKeyfile(profile);
  assert.equal(profile.protocol, "WireGuard");
  assert.ok(keyfile.includes(`id=${PROFILE_IDS.wireguard}`));
});

test("proxy profile includes proxy port", () => {
  const profile = profileBySlug("proxy");
  assert.equal(profile.mode, "proxy");
  assert.equal(profile.proxyPort, 40000);
});

test("allProfileKeyfiles yields stable filenames", () => {
  const files = allProfileKeyfiles();
  assert.equal(files.length, 3);
  assert.ok(files.some((f) => f.filename.includes("masque")));
  assert.ok(files.some((f) => f.filename.includes("wireguard")));
  assert.ok(files.some((f) => f.filename.includes("proxy")));
});
