import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  clearSessionOverrides,
  getConfig,
  persistUserTrayAutostart,
  reloadConfig
} from "../lib/config.mjs";
import {
  buildTrayAutostartDesktop,
  resolveTrayExec,
  syncTrayAutostart,
  trayAutostartPath
} from "../lib/tray/autostart.mjs";

test("buildTrayAutostartDesktop is a valid hidden autostart entry", () => {
  const desktop = buildTrayAutostartDesktop({ exec: "/usr/bin/thirdflare-one-tray", icon: "thirdflare" });
  assert.match(desktop, /^Type=Application/m);
  assert.match(desktop, /^Exec=\/usr\/bin\/thirdflare-one-tray/m);
  assert.match(desktop, /^Hidden=true/m);
  assert.match(desktop, /^NoDisplay=true/m);
});

test("syncTrayAutostart writes and removes the desktop file", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-auto-"));
  const env = { ...process.env, HOME: root, XDG_CONFIG_HOME: join(root, ".config") };
  const appRoot = join(root, "app");
  mkdirSync(join(appRoot, "bin"), { recursive: true });
  writeFileSync(join(appRoot, "bin", "thirdflare-tray"), "#!/bin/sh\n", { mode: 0o755 });

  try {
    const path = trayAutostartPath(env);
    assert.equal(existsSync(path), false);

    const enabled = syncTrayAutostart({ autostart: true, env, appRoot });
    assert.equal(enabled.written, true);
    assert.equal(existsSync(path), true);
    assert.match(readFileSync(path, "utf8"), new RegExp(`Exec=${join(appRoot, "bin", "thirdflare-tray").replace(/\//g, "\\/")}`));

    const again = syncTrayAutostart({ autostart: true, env, appRoot });
    assert.equal(again.unchanged, true);

    const disabled = syncTrayAutostart({ autostart: false, env, appRoot });
    assert.equal(disabled.removed, true);
    assert.equal(existsSync(path), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("persistUserTrayAutostart writes user config and survives reload", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-persist-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  writeFileSync(userPath, `${JSON.stringify({ ui: { locale: "en" } }, null, 2)}\n`);
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    const cfg = persistUserTrayAutostart({ autostart: true }, { env });
    assert.equal(cfg.tray.autostart, true);

    const onDisk = JSON.parse(readFileSync(userPath, "utf8"));
    assert.equal(onDisk.ui.locale, "en");
    assert.equal(onDisk.tray.autostart, true);

    clearSessionOverrides();
    const reloaded = reloadConfig(env);
    assert.equal(reloaded.tray.autostart, true);
    assert.equal(getConfig().tray.autostart, true);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("resolveTrayExec prefers FHS wrapper when present", () => {
  if (!existsSync("/usr/bin/thirdflare-one-tray")) {
    assert.equal(resolveTrayExec({}, "/tmp/nope"), "thirdflare-one-tray");
    return;
  }
  assert.equal(resolveTrayExec({}), "/usr/bin/thirdflare-one-tray");
});
