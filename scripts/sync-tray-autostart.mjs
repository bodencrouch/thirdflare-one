#!/usr/bin/env node
import { reloadConfig } from "../lib/config.mjs";
import { syncTrayAutostart } from "../lib/tray/autostart.mjs";

const config = reloadConfig(process.env);
const result = syncTrayAutostart({ autostart: config.tray?.autostart });
if (result.written) {
  console.log(`Tray autostart enabled (${result.path})`);
} else if (result.removed) {
  console.log(`Tray autostart disabled (removed ${result.path})`);
}
