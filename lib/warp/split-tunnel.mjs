/**
 * Parse warp-cli split-tunnel list/dump output into structured UI state.
 */

export function parseRouteList(stdout) {
  if (!stdout || typeof stdout !== "string") return [];
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !/^error:/i.test(line));
}

export function parseSplitTunnelMode(dumpStdout) {
  if (!dumpStdout || typeof dumpStdout !== "string") return "unknown";
  const lower = dumpStdout.toLowerCase();
  if (/include[- ]only|include mode|mode:\s*include|split tunnel mode:\s*include/.test(lower)) {
    return "include";
  }
  if (/exclude[- ]only|exclude mode|mode:\s*exclude|split tunnel mode:\s*exclude/.test(lower)) {
    return "exclude";
  }
  if (lower.includes("routes not included") || lower.includes("not included")) {
    return "include";
  }
  return "unknown";
}

export function parseManagedByDashboard(dumpStdout) {
  if (!dumpStdout || typeof dumpStdout !== "string") return false;
  const lower = dumpStdout.toLowerCase();
  return /device profile|dashboard|managed|remote config|organization policy|zero trust/.test(lower);
}

/**
 * @param {{ dump?: { stdout?: string } | string, ips?: { stdout?: string } | string, hosts?: { stdout?: string } | string }} input
 */
export function enrichSplitTunnel(input = {}) {
  const dumpText = typeof input.dump === "string" ? input.dump : (input.dump?.stdout ?? "");
  const ipText = typeof input.ips === "string" ? input.ips : (input.ips?.stdout ?? "");
  const hostText = typeof input.hosts === "string" ? input.hosts : (input.hosts?.stdout ?? "");

  const ips = parseRouteList(ipText);
  const hosts = parseRouteList(hostText);
  const mode = parseSplitTunnelMode(dumpText);
  const managedByDashboard = parseManagedByDashboard(dumpText);

  return {
    mode,
    ips,
    hosts,
    managedByDashboard,
    managedHint: managedByDashboard
      ? "Split tunnel routes may be managed by your Cloudflare device profile."
      : null
  };
}
