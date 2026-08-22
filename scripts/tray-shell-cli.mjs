#!/usr/bin/env node
/**
 * Tray shell helper for the launcher and install scripts.
 * argv only — never interpolates user input into a shell string.
 */
import { persistUserTrayShell, reloadConfig } from "../lib/config.mjs";
import {
  applyTrayShell,
  decorateTrayConfig,
  describeTrayShell,
  isValidTrayShell,
  isWarpDesktopSvcRunning,
  isWarpTaskbarRunning,
  startCloudflareGui,
  stopCloudflareGui,
  stopThirdflareTrayProcesses,
  syncTrayShell
} from "../lib/tray/shell.mjs";

const command = process.argv[2] || "describe";
const config = reloadConfig(process.env);
const info = describeTrayShell({
  shell: config.tray?.shell,
  autostart: config.tray?.autostart
});

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

switch (command) {
  case "describe":
    printJson(decorateTrayConfig(config));
    break;
  case "active":
    process.stdout.write(`${info.active}\n`);
    break;
  case "available":
    process.stdout.write(`${info.cloudflareAvailable ? "yes" : "no"}\n`);
    break;
  case "webui":
    process.stdout.write(`${config.webui?.enabled ? "enabled" : "disabled"}\n`);
    break;
  case "svc":
    process.stdout.write(`${isWarpDesktopSvcRunning() ? "running" : "stopped"}\n`);
    break;
  case "taskbar":
    process.stdout.write(`${isWarpTaskbarRunning() ? "running" : "stopped"}\n`);
    break;
  case "sync": {
    const result = syncTrayShell({
      shell: config.tray?.shell,
      autostart: config.tray?.autostart
    });
    printJson(result);
    break;
  }
  case "persist": {
    const shell = process.argv[3];
    if (!isValidTrayShell(shell)) {
      console.error("tray shell must be cloudflare or thirdflare");
      process.exit(2);
    }
    const autostart = shell === "thirdflare" ? true : undefined;
    const next = persistUserTrayShell({ shell, autostart });
    const result = applyTrayShell({
      shell: next.tray?.shell,
      autostart: next.tray?.autostart,
      live: false
    });
    printJson({ ok: true, config: decorateTrayConfig(next), ...result });
    break;
  }
  case "start": {
    const result = applyTrayShell({
      shell: config.tray?.shell,
      autostart: config.tray?.autostart,
      live: true
    });
    printJson(result);
    break;
  }
  case "start-cloudflare": {
    stopThirdflareTrayProcesses();
    const started = startCloudflareGui();
    printJson(started);
    if (started.ok === false) process.exit(1);
    break;
  }
  case "stop-cloudflare":
    printJson(stopCloudflareGui());
    break;
  case "stop-cloudflare-tray":
    // One-session swap: drop the tray icon, leave warp-desktop-svc alone.
    printJson(stopCloudflareGui({ keepService: true }));
    break;
  case "stop-thirdflare":
    printJson(stopThirdflareTrayProcesses());
    break;
  case "stop": {
    const stopped = { thirdflare: stopThirdflareTrayProcesses() };
    if (info.active === "cloudflare") {
      stopped.cloudflare = stopCloudflareGui();
    }
    printJson({ ok: true, ...stopped });
    break;
  }
  default:
    console.error(`Unknown tray-shell command: ${command}`);
    process.exit(2);
}
