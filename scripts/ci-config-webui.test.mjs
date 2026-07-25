import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  clearSessionOverrides,
  getConfig,
  isValidServerPort,
  persistUserServer,
  persistUserWebUi,
  persistUserUi,
  reloadConfig,
  setSessionOverrides
} from "../lib/config.mjs";

test("isValidServerPort accepts 1024-65535", () => {
  assert.equal(isValidServerPort(4173), true);
  assert.equal(isValidServerPort(1023), false);
  assert.equal(isValidServerPort(65536), false);
});

test("persistUserWebUi writes user config without clobbering other keys", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-webui-persist-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  writeFileSync(userPath, `${JSON.stringify({ ui: { locale: "en" } }, null, 2)}\n`);
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    const cfg = persistUserWebUi({ enabled: true }, { env });
    assert.equal(cfg.webui.enabled, true);

    const onDisk = JSON.parse(readFileSync(userPath, "utf8"));
    assert.equal(onDisk.ui.locale, "en");
    assert.equal(onDisk.webui.enabled, true);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("persistUserServer validates port range via caller", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-server-persist-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    const cfg = persistUserServer({ port: 4180 }, { env });
    assert.equal(cfg.server.port, 4180);
    const onDisk = JSON.parse(readFileSync(userPath, "utf8"));
    assert.equal(onDisk.server.port, 4180);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("session override ignores webui.enabled", () => {
  clearSessionOverrides();
  const before = getConfig().webui?.enabled;
  setSessionOverrides({ webui: { enabled: true } });
  assert.equal(getConfig().webui?.enabled, before);
  clearSessionOverrides();
});

test("THIRDFLARE_WEBUI=1 overrides file enabled:false at process start", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-webui-env-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  writeFileSync(userPath, `${JSON.stringify({ webui: { enabled: false } }, null, 2)}\n`);
  const env = { ...process.env, HOME: root, THIRDFLARE_WEBUI: "1" };

  try {
    clearSessionOverrides();
    const cfg = reloadConfig(env);
    assert.equal(cfg.webui.enabled, true);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("persistUserUi writes notifications preference", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-ui-persist-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    const cfg = persistUserUi({ notifications: false }, { env });
    assert.equal(cfg.ui.notifications, false);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});
