#!/usr/bin/env node
import { persistUserTrayShell, reloadConfig } from "../lib/config.mjs";
import { isValidTrayShell, syncTrayShell } from "../lib/tray/shell.mjs";

const args = process.argv.slice(2);
let persistShell = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--shell") {
    persistShell = args[i + 1];
    i += 1;
  }
}

if (persistShell != null) {
  if (!isValidTrayShell(persistShell)) {
    console.error("tray shell must be cloudflare or thirdflare");
    process.exit(2);
  }
  const autostart = persistShell === "thirdflare" ? true : undefined;
  persistUserTrayShell({ shell: persistShell, autostart });
}

const config = reloadConfig(process.env);
const result = syncTrayShell({
  shell: config.tray?.shell,
  autostart: config.tray?.autostart
});
if (result.skipped) {
  process.exit(0);
}
if (result.tray?.written) {
  console.log(`ThirdFlare One tray autostart enabled (${result.tray.path})`);
} else if (result.tray?.removed) {
  console.log(`ThirdFlare One tray autostart disabled (removed ${result.tray.path})`);
}
if (result.cloudflare?.written) {
  console.log(`Cloudflare One Client autostart hidden (${result.cloudflare.path})`);
} else if (result.cloudflare?.removed) {
  console.log(`Cloudflare One Client autostart restored (removed ${result.cloudflare.path})`);
}
