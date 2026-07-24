import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deriveDnsFamilies,
  deriveDnsLogging,
  deriveLocalNetworkAccess,
  deriveMasqueOption,
  enrichSettings,
  parseSettings
} from "../lib/warp/settings.mjs";

const REAL_OFF = `(user set)\tResolve via: cloudflare-dns.com @ [162.159.36.1]`;
const REAL_MALWARE = `(user set)\tResolve via: security.cloudflare-dns.com @ [1.1.1.2]`;
const REAL_FULL = `(user set)\tResolve via: family.cloudflare-dns.com @ [1.1.1.3]`;
const REAL_DNS_LOG_ON = `(user set)\tDNS logging until: SystemTime { tv_sec: 1 }`;
const REAL_MASQUE = `(not set)\tMASQUE Protocol Settings: \n  HTTP Version: MASQUE (HTTP/3 with HTTP/2 fallback)`;

test("parseSettings strips warp-cli source prefix", () => {
  const settings = parseSettings(`Merged configuration:\n(default)\tMode: Warp\n(user set)\tResolve via: cloudflare-dns.com`);
  assert.equal(settings.Mode, "Warp");
  assert.equal(settings["Resolve via"], "cloudflare-dns.com");
});

test("parseSettings captures multiline HTTP Version", () => {
  const settings = parseSettings(REAL_MASQUE);
  assert.equal(settings["HTTP Version"], "MASQUE (HTTP/3 with HTTP/2 fallback)");
});

test("deriveDnsFamilies maps Resolve via hostnames", () => {
  assert.equal(deriveDnsFamilies(parseSettings(REAL_OFF)), "off");
  assert.equal(deriveDnsFamilies(parseSettings(REAL_MALWARE)), "malware");
  assert.equal(deriveDnsFamilies(parseSettings(REAL_FULL)), "full");
});

test("deriveDnsLogging detects active logging", () => {
  assert.equal(deriveDnsLogging({ "DNS logging": "disabled" }), "disabled");
  assert.equal(deriveDnsLogging(parseSettings(REAL_DNS_LOG_ON)), "enabled");
  assert.equal(deriveDnsLogging({}), "disabled");
});

test("deriveMasqueOption maps HTTP Version display string", () => {
  assert.equal(deriveMasqueOption(parseSettings(REAL_MASQUE)), "h3-with-h2-fallback");
  assert.equal(deriveMasqueOption({ "MASQUE options": "h3-only" }), "h3-only");
});

test("deriveLocalNetworkAccess parses override show output", () => {
  assert.equal(deriveLocalNetworkAccess("No current access to local network"), "blocked");
  assert.equal(deriveLocalNetworkAccess("Local network access is allowed"), "allowed");
});

test("enrichSettings injects derived UI fields", () => {
  const enriched = enrichSettings(parseSettings(REAL_MALWARE), {
    localNetworkOverride: "No current access to local network"
  });
  assert.equal(enriched["DNS Families"], "malware");
  assert.equal(enriched["DNS logging"], "disabled");
  assert.equal(enriched["Local network access"], "blocked");
});

test("enrichSettings maps trusted network flags", () => {
  const enriched = enrichSettings({
    "Disabled for Wifi": "true",
    "Disabled for Ethernet": "false"
  });
  assert.equal(enriched["Wi-Fi WARP"], "disable");
  assert.equal(enriched["Ethernet WARP"], "keep");
});
