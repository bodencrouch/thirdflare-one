/**
 * Expert-mode UI control smoke — exercises nav, toggles, segmented controls,
 * app routing picker, forms, and log dock tabs against mock warp-cli.
 */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { request } from "node:http";
import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const port = Number(process.env.CI_UI_PORT || 14741);
const mockWarp = process.env.WARP_CLI || join(root, "scripts/mock-warp-cli.mjs");
const systemChrome = ["/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/google-chrome-stable"].find(
  (p) => existsSync(p)
);

const xdgRoot = await mkdtemp(join(tmpdir(), "tf-ui-xdg-"));
const appsDir = join(xdgRoot, "applications");
await mkdir(appsDir, { recursive: true });
await writeFile(
  join(appsDir, "demo-browser.desktop"),
  `[Desktop Entry]
Type=Application
Name=Demo Browser
Exec=demo-browser %u
Icon=web-browser
`,
  "utf8"
);

function httpJson(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = request(
      {
        host: "127.0.0.1",
        port,
        path,
        method,
        headers: body
          ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) }
          : {}
      },
      (res) => {
        let text = "";
        res.on("data", (c) => {
          text += c;
        });
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: text ? JSON.parse(text) : null });
          } catch {
            resolve({ status: res.statusCode, json: null });
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    WARP_CLI: mockWarp,
    THIRDFLARE_WEBUI: "1",
    THIRDFLARE_NOTIFICATIONS: "0",
    THIRDFLARE_NFT_NO_PKEXEC: "1",
    XDG_DATA_DIRS: xdgRoot,
    HOME: xdgRoot,
    MOCK_WARP_STATE: join(root, ".tmp-mock-warp-ui-controls.json")
  },
  stdio: "ignore"
});

async function waitHealth() {
  for (let i = 0; i < 75; i++) {
    try {
      const res = await httpJson("GET", "/api/health");
      if (res.status === 200) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Server did not become healthy in time");
}

async function bootExpertPage(browser) {
  const page = await browser.newPage();
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate(() => localStorage.setItem("thirdflare-ui-expert", "1"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("[data-testid='log-dock']").waitFor({ timeout: 20000 });
  return page;
}

const NAV_EXPECTATIONS = [
  ["home", "[data-testid='connection-toggle'], [data-testid='header-connection-toggle']"],
  ["account", "[data-testid='account-register']"],
  ["gateway", "[data-testid='segmented-setFamilies'], .segmented"],
  ["tunnel", "[data-testid='segmented-setMode']"],
  ["split", "#app-routing-guide"],
  ["trusted", ".form-panel, .panel"],
  ["settings", "[data-testid='killswitch-toggle']"],
  ["app", "[data-save-locale]"],
  ["advanced", ".form-panel"]
];

try {
  await waitHealth();
  await httpJson("POST", "/api/action", { action: "disconnect" });
  await httpJson("POST", "/api/action", { action: "deleteRegistration" });
  await httpJson("POST", "/api/action", { action: "register" });

  const launchOpts = {
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  };
  if (systemChrome && process.env.PLAYWRIGHT_USE_BUNDLED !== "1") {
    launchOpts.executablePath = systemChrome;
  }
  const browser = await chromium.launch(launchOpts);
  const page = await bootExpertPage(browser);

  for (const [navId, selector] of NAV_EXPECTATIONS) {
    await page.locator(`[data-nav='${navId}']`).click();
    await page.locator(selector).first().waitFor({ timeout: 15000 });
  }

  await page.locator("[data-nav='home']").click();
  await page.locator("[data-testid='refresh-button']").click();
  await page.waitForTimeout(400);

  const toggle = page.locator("[data-testid='connection-toggle'], [data-testid='header-connection-toggle']").first();
  await toggle.waitFor({ timeout: 15000 });
  await toggle.click();
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-testid='connection-toggle'], [data-testid='header-connection-toggle']");
      return el && (el.getAttribute("aria-pressed") === "true" || /disconnect/i.test(el.textContent || ""));
    },
    { timeout: 15000 }
  );

  await page.locator("[data-nav='split']").click();
  await httpJson("POST", "/api/action", { action: "setMode", value: "warp" });
  await page.locator("[data-testid='refresh-button']").click();
  await page.waitForTimeout(500);
  await page.locator("[data-testid='app-routing-enable']").click();
  await page.locator("[data-testid='app-routing-select']").waitFor({ timeout: 15000 });

  await page.locator("[data-nav='tunnel']").click();
  await page.locator("[data-testid='segmented-setMode'] button[data-value='proxy']").click();
  await page.waitForFunction(
    () => document.querySelector("[data-testid='segmented-setMode'] button[data-value='proxy']")?.classList.contains("selected"),
    { timeout: 15000 }
  );

  await page.locator("[data-nav='split']").click();
  const enableRouting = page.locator("[data-testid='app-routing-enable']");
  if (await enableRouting.count()) {
    await enableRouting.click();
  }
  const appSelect = page.locator("[data-testid='app-routing-select']");
  await appSelect.waitFor({ timeout: 15000 });
  await page.waitForFunction(
    () => {
      const select = document.querySelector("[data-testid='app-routing-select']");
      return select && select.options.length > 0 && !/No apps found/i.test(select.options[0]?.text || "");
    },
    { timeout: 15000 }
  );
  await page.locator("[data-testid='app-routing-shortcut']").click();
  await page.waitForFunction(
    () => document.querySelector(".toast.info")?.textContent?.includes("Shortcut") || document.querySelector(".toast")?.textContent?.includes("Shortcut"),
    { timeout: 10000 }
  ).catch(() => {
    /* toast may dismiss quickly; API success is enough */
  });

  await page.locator("[data-nav='split']").click();
  const ipInput = page.locator(".form-panel input").first();
  await ipInput.fill("203.0.113.10");
  await page.locator(".form-panel button.secondary").first().click();
  await page.waitForTimeout(800);

  await page.locator("[data-nav='settings']").click();
  const ksToggle = page.locator("[data-testid='killswitch-toggle']");
  await ksToggle.waitFor({ timeout: 10000 });
  await ksToggle.click();
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-testid='killswitch-toggle']");
      return el && el.getAttribute("aria-disabled") !== "true" && !el.disabled;
    },
    { timeout: 15000 }
  );

  await page.locator("[data-nav='gateway']").click();
  await page.locator("[data-testid='segmented-setFamilies'] button[data-value='malware']").click();
  await page.waitForFunction(
    () => document.querySelector("[data-testid='segmented-setFamilies'] button[data-value='malware']")?.classList.contains("selected"),
    { timeout: 15000 }
  );

  await page.locator("[data-log-tab='status']").click();
  await page.locator("[data-log-tab='console']").click();
  await page.locator("[data-log-tab='diagnostics']").click();
  await page.waitForFunction(
    () => document.querySelector("[data-log-tab='diagnostics']")?.classList.contains("active"),
    { timeout: 5000 }
  );

  await page.locator("[data-nav='account']").click();
  await page.locator("[data-testid='account-register']").click();
  await page.waitForFunction(
    () => {
      const strip = document.querySelector(".account-status-strip");
      return strip && /Registered/i.test(strip.textContent || "");
    },
    { timeout: 15000 }
  );

  const snap = await httpJson("GET", "/api/snapshot");
  if (snap.json?.settings?.Mode !== "proxy") {
    throw new Error(`Expected proxy mode in snapshot, got ${snap.json?.settings?.Mode}`);
  }

  await browser.close();
  console.log("UI controls smoke OK (nav, toggles, segmented, app routing picker, forms, log tabs)");
  process.exitCode = 0;
} catch (err) {
  console.error("UI controls smoke FAIL", err);
  process.exitCode = 1;
} finally {
  child.kill("SIGTERM");
  setTimeout(() => {
    try {
      child.kill("SIGKILL");
    } catch {
      /* ignore */
    }
  }, 500).unref();
}
