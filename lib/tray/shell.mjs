import { existsSync, mkdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { syncTrayAutostart, resolveAppRoot, resolveTrayExec } from "./autostart.mjs";

export const TRAY_SHELLS = new Set(["cloudflare", "thirdflare"]);
export const DEFAULT_TRAY_SHELL = "cloudflare";

export const WARP_TASKBAR_PATH = "/usr/bin/warp-taskbar";
export const WARP_DESKTOP_SVC_PATH = "/usr/bin/warp-desktop-svc";
export const WARP_DESKTOP_SVC_UNIT = "warp-desktop-svc.service";
export const WARP_DESKTOP_SVC_UNIT_PATH = "/usr/lib/systemd/user/warp-desktop-svc.service";
export const CLOUDFLARE_AUTOSTART_BASENAME = "com.cloudflare.WarpTaskbar.desktop";
export const CLOUDFLARE_OVERRIDE_MARKER = "Managed by ThirdFlare One";

const ALLOWED_WARP_GUI_REQUESTS = new Set([WARP_TASKBAR_PATH, WARP_DESKTOP_SVC_PATH]);

export function isValidTrayShell(value) {
  return TRAY_SHELLS.has(value);
}

export function normalizeTrayShell(value) {
  return isValidTrayShell(value) ? value : DEFAULT_TRAY_SHELL;
}

export function cloudflareAutostartOverridePath(env = process.env) {
  const home = env.HOME || env.USERPROFILE || homedir();
  const configHome = env.XDG_CONFIG_HOME || join(home, ".config");
  return join(configHome, "autostart", CLOUDFLARE_AUTOSTART_BASENAME);
}

export function buildCloudflareHiddenDesktop() {
  return `# ${CLOUDFLARE_OVERRIDE_MARKER}
[Desktop Entry]
Type=Application
Version=1.2
Name=Cloudflare One Client
Comment=View the current status of the WARP Tunnel
Exec=/usr/bin/warp-taskbar
Hidden=true
NoDisplay=true
X-GNOME-Autostart-enabled=false
StartupNotify=false
Keywords=warp teams cloudflare vpn
Icon=zero-trust-orange
Terminal=false
StartupWMClass=warp-taskbar
`;
}

export function isThirdflareManagedCloudflareOverride(content) {
  return typeof content === "string" && content.includes(CLOUDFLARE_OVERRIDE_MARKER);
}

export function detectCloudflareGui({
  taskbarPath = WARP_TASKBAR_PATH,
  desktopSvcPath = WARP_DESKTOP_SVC_PATH,
  exists = existsSync
} = {}) {
  return Boolean(exists(taskbarPath) && exists(desktopSvcPath));
}

export function isAllowedWarpGuiResolvedPath(resolved) {
  if (typeof resolved !== "string" || !resolved) return false;
  if (resolved === WARP_TASKBAR_PATH || resolved === WARP_DESKTOP_SVC_PATH) return true;
  return resolved.startsWith("/usr/lib/warp/");
}

export function resolveWarpGuiBinary(requestedPath, { exists = existsSync, realpath = realpathSync } = {}) {
  if (!ALLOWED_WARP_GUI_REQUESTS.has(requestedPath)) return null;
  if (!exists(requestedPath)) return null;
  try {
    const resolved = realpath(requestedPath);
    if (!isAllowedWarpGuiResolvedPath(resolved)) return null;
    return resolved;
  } catch {
    return null;
  }
}

export function describeTrayShell({
  shell,
  autostart = false,
  env = process.env,
  detect
} = {}) {
  const requested = normalizeTrayShell(shell);
  const cloudflareAvailable = detect
    ? detectCloudflareGui(detect)
    : detectCloudflareGui();
  const active = requested === "cloudflare" && cloudflareAvailable ? "cloudflare" : "thirdflare";
  return {
    shell: requested,
    autostart: Boolean(autostart),
    cloudflareAvailable,
    active
  };
}

export function decorateTrayConfig(config, detect) {
  const info = describeTrayShell({
    shell: config?.tray?.shell,
    autostart: config?.tray?.autostart,
    detect
  });
  return {
    ...config,
    tray: {
      autostart: Boolean(config?.tray?.autostart),
      shell: info.shell,
      cloudflareAvailable: info.cloudflareAvailable,
      active: info.active
    }
  };
}

export function graphicalSessionAvailable(env = process.env) {
  return Boolean(env.DISPLAY || env.WAYLAND_DISPLAY);
}

function shouldManageUnit(env = process.env, manageUnit) {
  if (typeof manageUnit === "boolean") return manageUnit;
  if (env.THIRDFLARE_TRAY_SKIP_SYSTEMD === "1") return false;
  if (env.NODE_TEST_CONTEXT) return false;
  return true;
}

function shouldLiveSwap(env = process.env, live) {
  if (live === false) return false;
  if (env.THIRDFLARE_TRAY_LIVE === "0") return false;
  if (env.NODE_TEST_CONTEXT) return false;
  return graphicalSessionAvailable(env);
}

export function syncCloudflareAutostartOverride({ hide, env = process.env } = {}) {
  if (process.platform !== "linux") {
    return { ok: true, skipped: true, reason: "non-linux" };
  }

  const path = cloudflareAutostartOverridePath(env);

  if (!hide) {
    if (!existsSync(path)) {
      return { ok: true, hidden: false, path, removed: false };
    }
    const existing = readFileSync(path, "utf8");
    if (!isThirdflareManagedCloudflareOverride(existing)) {
      return { ok: true, hidden: false, path, removed: false, preserved: true };
    }
    unlinkSync(path);
    return { ok: true, hidden: false, path, removed: true };
  }

  const content = buildCloudflareHiddenDesktop();
  const existing = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (existing === content) {
    return { ok: true, hidden: true, path, unchanged: true };
  }

  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, content, { mode: 0o644 });
  return { ok: true, hidden: true, path, written: true };
}

function runSystemctlUser(args, { env = process.env } = {}) {
  try {
    execFileSync("systemctl", ["--user", ...args], {
      env,
      stdio: "ignore",
      timeout: 8000
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function syncWarpDesktopSvcUnit({ enable, env = process.env, unitPath = WARP_DESKTOP_SVC_UNIT_PATH } = {}) {
  if (process.platform !== "linux") {
    return { skipped: true, reason: "non-linux" };
  }
  if (!existsSync(unitPath)) {
    return { skipped: true, reason: "no-unit" };
  }
  const action = enable ? "enable" : "disable";
  const result = runSystemctlUser([action, "--now", WARP_DESKTOP_SVC_UNIT], { env });
  return { ok: result.ok, enable: Boolean(enable), unit: WARP_DESKTOP_SVC_UNIT };
}

/**
 * Sync ThirdFlare and Cloudflare One Client XDG autostart so only one tray
 * launches at login. Linux-only; no-op elsewhere.
 */
export function syncTrayShell({
  shell,
  autostart,
  env = process.env,
  appRoot,
  manageUnit,
  detect,
  platform = process.platform
} = {}) {
  if (platform !== "linux") {
    return { ok: true, skipped: true, reason: "non-linux" };
  }

  const info = describeTrayShell({ shell, autostart, env, detect });
  const thirdflareAutostart = info.active === "thirdflare" && Boolean(autostart);
  const tray = syncTrayAutostart({ autostart: thirdflareAutostart, env, appRoot });
  const cloudflare = syncCloudflareAutostartOverride({
    hide: info.active === "thirdflare",
    env
  });

  let unit = { skipped: true, reason: "disabled" };
  if (shouldManageUnit(env, manageUnit)) {
    unit = syncWarpDesktopSvcUnit({ enable: info.active === "cloudflare", env });
  }

  return {
    ok: true,
    shell: info.shell,
    active: info.active,
    cloudflareAvailable: info.cloudflareAvailable,
    tray,
    cloudflare,
    unit
  };
}

function pgrepExact(name) {
  try {
    execFileSync("pgrep", ["-x", name], { stdio: "ignore", timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

function pkillExact(name) {
  try {
    execFileSync("pkill", ["-x", name], { stdio: "ignore", timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

function pkillScript(scriptName) {
  try {
    execFileSync("pkill", ["-f", scriptName], { stdio: "ignore", timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

export function isWarpTaskbarRunning() {
  return pgrepExact("warp-taskbar");
}

export function isWarpDesktopSvcRunning() {
  return pgrepExact("warp-desktop-svc");
}

export function stopCloudflareGui({ env = process.env, manageUnit } = {}) {
  const taskbar = pkillExact("warp-taskbar");
  let unit = { skipped: true };
  if (shouldManageUnit(env, manageUnit)) {
    unit = runSystemctlUser(["stop", WARP_DESKTOP_SVC_UNIT], { env });
  }
  const svc = pkillExact("warp-desktop-svc");
  return { ok: true, taskbar, svc, unit };
}

export function stopThirdflareTrayProcesses() {
  const qt = pkillScript("scripts/tray-qt.py");
  const sni = pkillScript("scripts/tray-sni.py");
  let yad = false;
  try {
    execFileSync("pkill", ["-f", "yad --notification.*thirdflare"], {
      stdio: "ignore",
      timeout: 4000
    });
    yad = true;
  } catch {
    yad = false;
  }
  return { ok: true, qt, sni, yad };
}

export function startCloudflareGui({ env = process.env, manageUnit } = {}) {
  const taskbar = resolveWarpGuiBinary(WARP_TASKBAR_PATH);
  if (!taskbar) {
    return { ok: false, reason: "missing-taskbar" };
  }

  const manage = shouldManageUnit(env, manageUnit);
  if (manage) {
    const unit = syncWarpDesktopSvcUnit({ enable: true, env });
    if (unit.skipped) {
      const svcPath = resolveWarpGuiBinary(WARP_DESKTOP_SVC_PATH);
      if (svcPath && !isWarpDesktopSvcRunning()) {
        const child = spawn(svcPath, [], {
          env,
          detached: true,
          stdio: "ignore"
        });
        child.unref();
      }
    }
  }

  if (isWarpTaskbarRunning()) {
    return { ok: true, alreadyRunning: true, path: taskbar };
  }

  const child = spawn(taskbar, [], {
    env,
    detached: true,
    stdio: "ignore"
  });
  child.unref();
  return { ok: true, pid: child.pid, path: taskbar };
}

function startThirdflareTray({ env = process.env, appRoot } = {}) {
  const root = appRoot || resolveAppRoot(env);
  const exec = resolveTrayExec(env, root);
  const child = spawn(exec, ["--force-thirdflare"], {
    env: { ...env, THIRDFLARE_WEBUI: "1" },
    detached: true,
    stdio: "ignore"
  });
  child.unref();
  return { ok: true, pid: child.pid, exec };
}

export function swapRunningShell({ active, env = process.env, appRoot, manageUnit } = {}) {
  if (active === "cloudflare") {
    stopThirdflareTrayProcesses();
    return startCloudflareGui({ env, manageUnit });
  }
  stopCloudflareGui({ env, manageUnit });
  return startThirdflareTray({ env, appRoot });
}

/**
 * Persist-time apply: autostart files always; live process swap when a
 * graphical session is present and not disabled for tests.
 */
export function applyTrayShell({
  shell,
  autostart,
  env = process.env,
  appRoot,
  manageUnit,
  live,
  detect
} = {}) {
  const sync = syncTrayShell({
    shell,
    autostart,
    env,
    appRoot,
    manageUnit,
    detect
  });

  if (!shouldLiveSwap(env, live)) {
    return {
      sync,
      liveSwap: {
        attempted: false,
        reason: graphicalSessionAvailable(env) ? "disabled" : "no-display"
      }
    };
  }

  return {
    sync,
    liveSwap: {
      attempted: true,
      ...swapRunningShell({
        active: sync.active,
        env,
        appRoot,
        manageUnit
      })
    }
  };
}
