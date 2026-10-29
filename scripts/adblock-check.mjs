// Renders the "Affiche publicitaire" and partner pages in Playwright Chromium with uBlock Origin
// loaded (persistent context) and fails on any request the extension blocks.
//   node scripts/adblock-check.mjs [--target=dev]     (default: the build, via serve-static)
// uBlock Origin is downloaded once into scripts/.cache/ublock. Its default lists are EasyList +
// the uBO lists; the French regional lists French visitors get (AdGuard Français, auto-enabled for
// a French browser, and EasyList Liste FR, used by AdBlock / Adblock Plus — its "/publicite."
// rule is the one that blocked src/content/pages/publicite.ts) are switched on too.
// A canary request (/publicite.js) must be blocked, which proves the filters are active.
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startDev } from "./dev-server.mjs";
import { serve } from "./serve-static.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UBO_VERSION = "1.75.0";
const cache = path.join(root, "scripts/.cache/ublock");
const ext = path.join(cache, "uBlock0.chromium");
const TARGET = process.argv.find((a) => a.startsWith("--target="))?.slice(9) ?? "preview";
const PORT = TARGET === "dev" ? 4321 : 4311;
const BASE = `http://localhost:${PORT}`;
const routes = JSON.parse(fs.readFileSync(path.join(root, "src/content/routes.json"), "utf8"));
const PAGES = [
  "grand-format",
  "amenagements",
  "structures",
  "partenaires-mode",
  "confection-sport",
  "partenaires-pub",
].map((key) => routes.find((r) => r.key === key));

// 1. uBlock Origin (MV2 build), with the French regional lists enabled by default.
if (!fs.existsSync(path.join(ext, "manifest.json"))) {
  fs.mkdirSync(cache, { recursive: true });
  const zip = path.join(cache, "ubo.zip");
  const url = `https://github.com/gorhill/uBlock/releases/download/${UBO_VERSION}/uBlock0_${UBO_VERSION}.chromium.zip`;
  fs.writeFileSync(zip, Buffer.from(await (await fetch(url)).arrayBuffer()));
  execSync(
    process.platform === "win32"
      ? `powershell -NoProfile -Command "Expand-Archive -Force '${zip}' '${cache}'"`
      : `unzip -oq '${zip}' -d '${cache}'`,
  );
}
const assetsFile = path.join(ext, "assets/assets.json");
const assets = JSON.parse(fs.readFileSync(assetsFile, "utf8"));
assets["FRA-0"].off = false;
assets["liste-fr"] = {
  content: "filters",
  group: "regions",
  title: "EasyList Liste FR",
  lang: "fr",
  contentURL: "https://easylist-downloads.adblockplus.org/liste_fr.txt",
};
fs.writeFileSync(assetsFile, JSON.stringify(assets, null, "\t"));

// 2. Site + browser.
const server = TARGET === "dev" ? await startDev(PORT) : await serve(PORT);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "yb-ubo-"));
const context = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  headless: true,
  locale: "fr-FR",
  viewport: { width: 1440, height: 900 },
  args: [
    `--disable-extensions-except=${ext}`,
    `--load-extension=${ext}`,
    "--lang=fr-FR",
    // Chromium 13x hides MV2 extensions behind these flags.
    "--disable-features=ExtensionManifestV2Unsupported,ExtensionManifestV2Disabled",
  ],
});

const results = [];
const record = (name, ok, detail = "") => results.push({ name, ok, detail });

// 3. Wait until uBlock has compiled its lists: the canary must come back blocked.
const probe = await context.newPage();
await probe.goto(BASE + "/contact/", { waitUntil: "domcontentloaded" });
let active = false;
for (let i = 0; i < 90 && !active; i++) {
  active = await probe.evaluate(() =>
    fetch(`/publicite.js?${Date.now()}`).then(
      () => false,
      () => true,
    ),
  );
  if (!active) await probe.waitForTimeout(1000);
}
record("uBlock Origin active (canary /publicite.js blocked)", active);
await probe.close();

// 4. The pages.
for (const r of PAGES) {
  const page = await context.newPage();
  const blocked = [];
  const errors = [];
  page.on("requestfailed", (q) => {
    if (q.failure()?.errorText === "net::ERR_BLOCKED_BY_CLIENT") blocked.push(q.url().replace(BASE, ""));
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + r.path, { waitUntil: "networkidle", timeout: 120000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 60));
    }
  });
  await page.waitForTimeout(800);
  const h1 = (await page.locator("h1").first().textContent().catch(() => ""))?.replace(/\s+/g, " ").trim();
  const imgs = await page.$$eval("main img", (els) => els.filter((e) => e.naturalWidth > 0).length);
  record(`${TARGET} ${r.path} no blocked requests`, blocked.length === 0, blocked.slice(0, 4).join(", "));
  record(`${TARGET} ${r.path} renders (h1 "${r.h1}")`, h1 === r.h1.replace(/\s+/g, " ").trim() && errors.length === 0, `h1="${h1}" ${errors.slice(0, 2).join(" || ")}`);
  record(`${TARGET} ${r.path} images load (${imgs})`, imgs > 0);
  await page.close();
}

await context.close();
server.close();
fs.rmSync(profile, { recursive: true, force: true });

const w = Math.max(...results.map((r) => r.name.length));
for (const r of results)
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(w)}  ${r.ok ? "" : r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks pass`);
process.exitCode = failed ? 1 : 0;
