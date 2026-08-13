import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  clearSessionOverrides,
  getConfig,
  persistUserTrayAutostart,
  persistUserTrayShell,
  reloadConfig
} from "../lib/config.mjs";
import {
  buildTrayAutostartDesktop,
  resolveTrayExec,
  syncTrayAutostart,
  trayAutostartPath
} from "../lib/tray/autostart.mjs";
import {
  buildCloudflareHiddenDesktop,
  cloudflareAutostartOverridePath,
  detectCloudflareGui,
  describeTrayShell,
  isThirdflareManagedCloudflareOverride,
  resolveWarpGuiBinary,
  syncCloudflareAutostartOverride,
  syncTrayShell
} from "../lib/tray/shell.mjs";

test("buildTrayAutostartDesktop is a valid hidden autostart entry", () => {
  const desktop = buildTrayAutostartDesktop({ exec: "/usr/bin/thirdflare-one-tray", icon: "thirdflare" });
  assert.match(desktop, /^Type=Application/m);
  assert.match(desktop, /^Exec=\/usr\/bin\/thirdflare-one-tray/m);
  assert.match(desktop, /^Hidden=true/m);
  assert.match(desktop, /^NoDisplay=true/m);
});

test("syncTrayAutostart writes and removes the desktop file", { skip: process.platform !== "linux" ? "linux-only" : false }, () => {
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

test("default tray.shell is cloudflare", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-default-"));
  const env = { ...process.env, HOME: root };
  try {
    clearSessionOverrides();
    const cfg = reloadConfig(env);
    assert.equal(cfg.tray.shell, "cloudflare");
    assert.equal(cfg.tray.autostart, false);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("persistUserTrayShell writes shell and survives reload", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-shell-persist-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  writeFileSync(userPath, `${JSON.stringify({ ui: { locale: "en" } }, null, 2)}\n`);
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    const cfg = persistUserTrayShell({ shell: "thirdflare" }, { env });
    assert.equal(cfg.tray.shell, "thirdflare");

    const onDisk = JSON.parse(readFileSync(userPath, "utf8"));
    assert.equal(onDisk.ui.locale, "en");
    assert.equal(onDisk.tray.shell, "thirdflare");

    clearSessionOverrides();
    const reloaded = reloadConfig(env);
    assert.equal(reloaded.tray.shell, "thirdflare");
    assert.equal(getConfig().tray.shell, "thirdflare");
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("persistUserTrayShell rejects unknown values", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-shell-bad-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  writeFileSync(userPath, `${JSON.stringify({ ui: { locale: "en" } }, null, 2)}\n`);
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    reloadConfig(env);
    const rejected = persistUserTrayShell({ shell: "nope" }, { env });
    assert.equal(rejected, null);
    const onDisk = JSON.parse(readFileSync(userPath, "utf8"));
    assert.equal(onDisk.ui.locale, "en");
    assert.equal(onDisk.tray, undefined);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("persistUserTrayShell cloudflare clears ThirdFlare autostart", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-shell-clear-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  writeFileSync(userPath, `${JSON.stringify({ tray: { autostart: true, shell: "thirdflare" } }, null, 2)}\n`);
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    reloadConfig(env);
    const cfg = persistUserTrayShell({ shell: "cloudflare" }, { env });
    assert.equal(cfg.tray.shell, "cloudflare");
    assert.equal(cfg.tray.autostart, false);
    const onDisk = JSON.parse(readFileSync(userPath, "utf8"));
    assert.equal(onDisk.tray.autostart, false);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("invalid tray.shell in user JSON falls back to cloudflare", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-shell-norm-"));
  const userPath = join(root, ".config", "thirdflare", "config.json");
  mkdirSync(join(root, ".config", "thirdflare"), { recursive: true });
  writeFileSync(userPath, `${JSON.stringify({ tray: { shell: "nope" } }, null, 2)}\n`);
  const env = { ...process.env, HOME: root };

  try {
    clearSessionOverrides();
    const cfg = reloadConfig(env);
    assert.equal(cfg.tray.shell, "cloudflare");
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("detectCloudflareGui is true only when both stubs exist", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-cf-detect-"));
  const taskbarPath = join(root, "warp-taskbar");
  const desktopSvcPath = join(root, "warp-desktop-svc");
  try {
    assert.equal(detectCloudflareGui({ taskbarPath, desktopSvcPath }), false);
    writeFileSync(taskbarPath, "");
    assert.equal(detectCloudflareGui({ taskbarPath, desktopSvcPath }), false);
    writeFileSync(desktopSvcPath, "");
    assert.equal(detectCloudflareGui({ taskbarPath, desktopSvcPath }), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("describeTrayShell falls back to thirdflare when Cloudflare GUI is missing", () => {
  const info = describeTrayShell({
    shell: "cloudflare",
    detect: { taskbarPath: "/tmp/missing-warp-taskbar", desktopSvcPath: "/tmp/missing-warp-desktop-svc" }
  });
  assert.equal(info.shell, "cloudflare");
  assert.equal(info.cloudflareAvailable, false);
  assert.equal(info.active, "thirdflare");
});

test("resolveWarpGuiBinary allow-lists host WARP GUI paths", () => {
  const fakeExists = () => true;
  assert.equal(
    resolveWarpGuiBinary("/usr/bin/warp-taskbar", {
      exists: fakeExists,
      realpath: () => "/usr/lib/warp/warp-taskbar"
    }),
    "/usr/lib/warp/warp-taskbar"
  );
  assert.equal(
    resolveWarpGuiBinary("/usr/bin/warp-desktop-svc", {
      exists: fakeExists,
      realpath: () => "/usr/bin/warp-desktop-svc"
    }),
    "/usr/bin/warp-desktop-svc"
  );
  assert.equal(
    resolveWarpGuiBinary("/tmp/evil", { exists: fakeExists, realpath: () => "/tmp/evil" }),
    null
  );
  assert.equal(
    resolveWarpGuiBinary("/usr/bin/warp-taskbar", {
      exists: fakeExists,
      realpath: () => "/tmp/evil"
    }),
    null
  );
});

test("buildCloudflareHiddenDesktop is a managed Hidden override", () => {
  const desktop = buildCloudflareHiddenDesktop();
  assert.match(desktop, /Managed by ThirdFlare One/);
  assert.match(desktop, /^Hidden=true/m);
  assert.match(desktop, /^Exec=\/usr\/bin\/warp-taskbar/m);
  assert.equal(isThirdflareManagedCloudflareOverride(desktop), true);
  assert.equal(isThirdflareManagedCloudflareOverride("[Desktop Entry]\nName=Other\n"), false);
});

test("syncTrayShell writes and removes the Cloudflare Hidden override", {
  skip: process.platform !== "linux" ? "linux-only" : false
}, () => {
  const root = mkdtempSync(join(tmpdir(), "tf-tray-shell-sync-"));
  const env = { ...process.env, HOME: root, XDG_CONFIG_HOME: join(root, ".config") };
  const appRoot = join(root, "app");
  mkdirSync(join(appRoot, "bin"), { recursive: true });
  writeFileSync(join(appRoot, "bin", "thirdflare-tray"), "#!/bin/sh\n", { mode: 0o755 });
  const detect = {
    taskbarPath: join(root, "missing-taskbar"),
    desktopSvcPath: join(root, "missing-svc")
  };

  try {
    const overridePath = cloudflareAutostartOverridePath(env);
    const trayPath = trayAutostartPath(env);

    const thirdflare = syncTrayShell({
      shell: "thirdflare",
      autostart: true,
      env,
      appRoot,
      manageUnit: false,
      detect
    });
    assert.equal(thirdflare.active, "thirdflare");
    assert.equal(thirdflare.cloudflare.written, true);
    assert.equal(existsSync(overridePath), true);
    assert.match(readFileSync(overridePath, "utf8"), /Hidden=true/);
    assert.equal(existsSync(trayPath), true);

    const cloudflareMissing = syncTrayShell({
      shell: "cloudflare",
      autostart: true,
      env,
      appRoot,
      manageUnit: false,
      detect
    });
    assert.equal(cloudflareMissing.active, "thirdflare");
    assert.equal(existsSync(overridePath), true);

    writeFileSync(join(root, "warp-taskbar"), "");
    writeFileSync(join(root, "warp-desktop-svc"), "");
    const cloudflare = syncTrayShell({
      shell: "cloudflare",
      autostart: true,
      env,
      appRoot,
      manageUnit: false,
      detect: {
        taskbarPath: join(root, "warp-taskbar"),
        desktopSvcPath: join(root, "warp-desktop-svc")
      }
    });
    assert.equal(cloudflare.active, "cloudflare");
    assert.equal(cloudflare.cloudflare.removed, true);
    assert.equal(existsSync(overridePath), false);
    assert.equal(existsSync(trayPath), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("syncCloudflareAutostartOverride preserves unmanaged user files", {
  skip: process.platform !== "linux" ? "linux-only" : false
}, () => {
  const root = mkdtempSync(join(tmpdir(), "tf-cf-preserve-"));
  const env = { ...process.env, HOME: root, XDG_CONFIG_HOME: join(root, ".config") };
  const path = cloudflareAutostartOverridePath(env);
  mkdirSync(join(root, ".config", "autostart"), { recursive: true });
  writeFileSync(path, "[Desktop Entry]\nName=Custom\n");

  try {
    const result = syncCloudflareAutostartOverride({ hide: false, env });
    assert.equal(result.preserved, true);
    assert.equal(existsSync(path), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("syncTrayShell is a no-op on non-linux", () => {
  const result = syncTrayShell({ shell: "thirdflare", platform: "darwin", manageUnit: false });
  assert.equal(result.skipped, true);
  assert.equal(result.reason, "non-linux");
});

test("sync-tray-autostart --shell thirdflare persists without prompting", () => {
  const root = mkdtempSync(join(tmpdir(), "tf-sync-shell-"));
  const userDir = join(root, ".config", "thirdflare");
  mkdirSync(userDir, { recursive: true });
  const env = {
    ...process.env,
    HOME: root,
    XDG_CONFIG_HOME: join(root, ".config"),
    THIRDFLARE_TRAY_SKIP_SYSTEMD: "1",
    THIRDFLARE_TRAY_LIVE: "0"
  };
  const syncScript = join(dirname(fileURLToPath(import.meta.url)), "sync-tray-autostart.mjs");
  try {
    execFileSync(process.execPath, [syncScript, "--shell", "thirdflare"], { env, encoding: "utf8" });
    const onDisk = JSON.parse(readFileSync(join(userDir, "config.json"), "utf8"));
    assert.equal(onDisk.tray.shell, "thirdflare");
    assert.equal(onDisk.tray.autostart, true);

    execFileSync(process.execPath, [syncScript, "--shell", "cloudflare"], { env, encoding: "utf8" });
    const cloudflare = JSON.parse(readFileSync(join(userDir, "config.json"), "utf8"));
    assert.equal(cloudflare.tray.shell, "cloudflare");
    assert.equal(cloudflare.tray.autostart, false);
  } finally {
    clearSessionOverrides();
    reloadConfig(process.env);
    rmSync(root, { recursive: true, force: true });
  }
});

test("sync-tray-autostart --shell rejects unknown values", () => {
  const syncScript = join(dirname(fileURLToPath(import.meta.url)), "sync-tray-autostart.mjs");
  try {
    execFileSync(process.execPath, [syncScript, "--shell", "nope"], {
      encoding: "utf8",
      stdio: ["ignore", "ignore", "pipe"]
    });
    assert.fail("expected non-zero exit");
  } catch (error) {
    assert.equal(error.status, 2);
  }
});
