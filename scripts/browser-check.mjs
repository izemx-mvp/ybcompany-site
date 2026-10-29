// Browser checks with Playwright (Chromium).
//   VITE_CHAT_ENDPOINT=https://chat.mock.test/chat npm run build && node scripts/browser-check.mjs
//   node scripts/browser-check.mjs --target=dev     (starts `vite dev`; ad-blocker path check only)
// The default target ("preview") is the prerendered build in .output/public, served like
// Cloudflare by serve-static.mjs (`vite preview` cannot serve the Nitro cloudflare output).
// On all 19 routes: no requested URL other than the page document itself (JS, CSS, images,
// fonts…) may contain a word ad blockers filter (neutral-paths.mjs AD_WORDS). In dev only, the
// route modules (/src/routes/<folder>/…, folders kept: they define the SEO-locked URLs) and
// TanStack's dev stylesheet (whose ?routes= query lists them) are exempt and counted; the build
// has neither (hash-only chunks), and adblock-check.mjs shows uBlock does not block them.
// The chat endpoint is intercepted and answered with a scripted SSE stream, so no backend is
// needed. Checks: horizontal overflow, console errors, reduced motion (all copy visible, no
// split/hidden text), redirects, chat open/close/chips/streaming/mobile fullscreen, and that
// the chat panel chunk is not loaded before the launcher is used.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { AD_WORDS } from "./neutral-paths.mjs";
import { startDev } from "./dev-server.mjs";
import { serve } from "./serve-static.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = path.join(root, "scripts/.cache/screens");
fs.mkdirSync(SHOTS, { recursive: true });
const TARGET = process.argv.find((a) => a.startsWith("--target="))?.slice(9) ?? "preview";
const PORT = TARGET === "dev" ? 4320 : 4310;
const BASE = `http://localhost:${PORT}`;
const ROUTES = JSON.parse(fs.readFileSync(path.join(root, "src/content/routes.json"), "utf8")).map(
  (r) => r.path,
);
const PAGES = [
  "/",
  "/textile-habillement/habillement-textile-sport-casual/",
  "/textile-habillement/habillement-mode/",
  "/contact/",
];
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

const server = TARGET === "dev" ? await startDev(PORT) : await serve(PORT);
const browser = await chromium.launch();
const results = [];
const record = (name, ok, detail = "") => results.push({ name, ok, detail });

const MOCK_SSE = [
  { type: "delta", text: "Bonjour ! Nous confectionnons des **tenues de sport** sur mesure." },
  {
    type: "cards",
    cards: [
      {
        title: "Sport casual",
        path: "/textile-habillement/habillement-textile-sport-casual/",
        key: "sport-casual",
        excerpt: "Tenues de sport",
      },
    ],
  },
  { type: "done" },
]
  .map((e) => `data: ${JSON.stringify(e)}\n\n`)
  .join("");

async function newPage(viewport, { reducedMotion = "no-preference" } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    // Image slots not yet supplied (see IMAGES.md) are expected to 404.
    if (/Failed to load resource.*404/.test(t)) return;
    errors.push(t);
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.route("https://chat.mock.test/**", (route) =>
    route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream", "access-control-allow-origin": "*" },
      body: MOCK_SSE,
    }),
  );
  return { context, page, errors };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += Math.round(innerHeight * 0.7)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

const overflow = (page) =>
  page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    if (sw <= w + 1) return null;
    const culprits = [...document.querySelectorAll("body *")]
      .filter(
        (el) =>
          el.getBoundingClientRect().right > w + 1 && getComputedStyle(el).position !== "fixed",
      )
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
    return `scrollWidth ${sw} > ${w}: ${culprits.join(" | ")}`;
  });

// Ad blockers drop any request whose URL contains an ad-related word (EasyList); only the page
// document itself is exempt (URLs are SEO-locked). Scrolling loads the lazy images.
for (const p of ROUTES) {
  const { context, page } = await newPage({ width: 1440, height: 900 });
  const bad = new Set();
  const exempt = new Set();
  page.on("request", (r) => {
    if (r.isNavigationRequest() && r.frame() === page.mainFrame()) return;
    const u = r.url().replace(BASE, "");
    if (!AD_WORDS.test(u)) return;
    if (TARGET === "dev" && /^\/(src\/routes\/|@tanstack-start\/styles\.css\?)/.test(u)) exempt.add(u);
    else bad.add(u);
  });
  await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 120000 });
  await scrollThrough(page);
  record(
    `${TARGET} ${p} no ad-filtered request URLs${exempt.size ? ` (${exempt.size} dev route-module URLs exempt)` : ""}`,
    bad.size === 0,
    [...bad].slice(0, 4).join(", "),
  );
  await context.close();
}

for (const vp of TARGET === "dev" ? [] : VIEWPORTS) {
  for (const p of PAGES) {
    const { context, page, errors } = await newPage(vp);
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await scrollThrough(page);
    const slug = p === "/" ? "home" : p.split("/").filter(Boolean).pop();
    await page.screenshot({ path: path.join(SHOTS, `${slug}-${vp.name}.png`) });
    // Any slot still rendering the navy placeholder instead of a real image.
    const ph = await page.$$eval("[data-slot]", (els) => els.map((e) => e.getAttribute("data-slot")));
    record(`${vp.name} ${p} no placeholder slots`, ph.length === 0, ph.join(", "));
    const o = await overflow(page);
    record(`${vp.name} ${p} no horizontal overflow`, !o, o ?? "");
    record(
      `${vp.name} ${p} no console errors`,
      errors.length === 0,
      errors.slice(0, 3).join(" || "),
    );
    await context.close();
  }
}

// Reduced motion: every split heading must be fully visible without scrolling into view.
for (const p of TARGET === "dev" ? [] : PAGES) {
  const { context, page, errors } = await newPage(
    { width: 1440, height: 900 },
    { reducedMotion: "reduce" },
  );
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3,p")]
      .filter((el) => {
        const s = getComputedStyle(el);
        return (
          el.textContent?.trim() &&
          (Number(s.opacity) < 0.99 || s.visibility === "hidden") &&
          !el.closest("[hidden],[aria-hidden=true]")
        );
      })
      .slice(0, 3)
      .map((el) => el.textContent?.trim().slice(0, 40)),
  );
  const lenis = await page.evaluate(() => document.documentElement.classList.contains("lenis"));
  record(`reduced-motion ${p} text visible`, hidden.length === 0, hidden.join(" | "));
  record(`reduced-motion ${p} no smooth scroll`, !lenis);
  record(
    `reduced-motion ${p} no console errors`,
    errors.length === 0,
    errors.slice(0, 2).join(" || "),
  );
  await context.close();
}

// Redirects
for (const [from, to] of TARGET === "dev" ? [] : [
  ["/contact", "/contact/"],
  ["/nous-connaitre/", "/nous-connaitre/philosophie/"],
  ["/textile-habillement", "/textile-habillement/notre-valeur-ajoutee/"],
]) {
  const res = await fetch(BASE + from, { redirect: "manual" });
  record(
    `redirect ${from}`,
    res.status === 301 && res.headers.get("location") === to,
    `${res.status} ${res.headers.get("location")}`,
  );
}

// Chat
for (const vp of TARGET === "dev" ? [] : VIEWPORTS) {
  const { context, page, errors } = await newPage(vp);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  // Chunk names are hash-only, so "panel not in the initial load" = opening fetches new JS.
  const lateJs = [];
  page.on("request", (r) => r.resourceType() === "script" && lateJs.push(r.url()));
  await page.getByRole("button", { name: "Ouvrir l'Assistant YB" }).click();
  const dialog = page.getByRole("dialog", { name: "Assistant YB" });
  await dialog.waitFor({ timeout: 8000 });
  record(`${vp.name} chat opens`, await dialog.isVisible());
  record(`${vp.name} chat panel chunk loaded on open, not before`, lateJs.length > 0);
  const box = await dialog.boundingBox();
  if (vp.width < 640)
    record(
      `${vp.name} chat fullscreen on mobile`,
      !!box && box.width >= vp.width - 1 && box.height >= vp.height - 1,
      JSON.stringify(box),
    );
  else record(`${vp.name} chat docked on desktop`, !!box && box.width <= 420, JSON.stringify(box));
  await dialog.getByRole("button", { name: "Tenues de sport" }).click();
  const streamed = await dialog
    .locator("strong", { hasText: "tenues de sport" })
    .waitFor({ timeout: 8000 })
    .then(() => 1)
    .catch(() => 0);
  record(`${vp.name} chat chip → streamed markdown`, streamed > 0);
  const card = await dialog
    .locator('a[href="/textile-habillement/habillement-textile-sport-casual/"]')
    .first()
    .waitFor({ timeout: 4000 })
    .then(() => 1)
    .catch(() => 0);
  record(`${vp.name} chat page card`, card > 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  record(`${vp.name} chat closes with Esc`, !(await dialog.isVisible().catch(() => false)));
  record(`${vp.name} chat no console errors`, errors.length === 0, errors.slice(0, 2).join(" || "));
  await context.close();
}

await browser.close();
server.close();

console.log(`screenshots: ${SHOTS}`);
const w = Math.max(...results.map((r) => r.name.length));
for (const r of results)
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(w)}  ${r.ok ? "" : r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks pass`);
process.exitCode = failed ? 1 : 0;
