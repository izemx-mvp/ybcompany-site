// SEO parity check: compares the prerendered HTML in .output/public with the live-site reference
// (scripts/reference/live-reference.json, produced by extract-live.mjs) and the route table.
//   npm run build && node scripts/seo-check.mjs [--verbose]
// Exit code 1 when any check fails.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, ".output/public");
const SITE = "https://ybcompany.ma";
const verbose = process.argv.includes("--verbose");
const routes = JSON.parse(fs.readFileSync(path.join(root, "src/content/routes.json"), "utf8"));
const reference = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/reference/live-reference.json"), "utf8"),
);
const ANCHORS = {
  "business-model": ["textile-habillement", "industrie-publicitaire", "affichage-dynamique"],
  "valeur-ajoutee": ["notre-activite", "nos-atouts"],
};

// Whitespace-insensitive comparison: tables/spans/line breaks may split text differently.
const compact = (s) => (s ?? "").replace(/[\s ​]+/g, "").normalize("NFC");

const rows = [];
let failures = 0;

for (const r of routes) {
  const file = path.join(out, r.path, "index.html");
  const ref = reference[r.path];
  const checks = {};
  const notes = [];
  const fail = (name, msg) => {
    checks[name] = false;
    if (msg) notes.push(`${name}: ${msg}`);
  };
  const pass = (name) => (checks[name] ??= true);

  if (!fs.existsSync(file)) {
    rows.push({ path: r.path, result: "FAIL", notes: ["not prerendered"] });
    failures++;
    continue;
  }
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  const meta = (sel) => $(sel).attr("content");

  // Head
  $("title").text() === r.title ? pass("title") : fail("title", $("title").text());
  const desc = meta('meta[name="description"]');
  (r.description ?? undefined) === desc
    ? pass("description")
    : fail("description", `got ${desc ?? "none"}`);
  $('link[rel="canonical"]').attr("href") === SITE + r.path ? pass("canonical") : fail("canonical");
  const og =
    meta('meta[property="og:locale"]') === "fr_FR" &&
    meta('meta[property="og:site_name"]') === "YB Company" &&
    meta('meta[property="og:url"]') === SITE + r.path &&
    meta('meta[property="og:title"]') === r.title &&
    !!meta('meta[property="og:image"]') &&
    !!meta('meta[name="twitter:card"]');
  og ? pass("og") : fail("og");
  $("html").attr("lang") === "fr" ? pass("lang") : fail("lang");

  // JSON-LD
  const types = $('script[type="application/ld+json"]')
    .map((_, el) => {
      try {
        const j = JSON.parse($(el).text());
        return (Array.isArray(j) ? j : (j["@graph"] ?? [j])).map((x) => x["@type"]).flat();
      } catch {
        return [];
      }
    })
    .get()
    .flat();
  const wantLd = r.path === "/" ? ["Organization", "LocalBusiness"] : ["BreadcrumbList"];
  wantLd.every((t) => types.includes(t))
    ? pass("jsonld")
    : fail("jsonld", `types ${types.join(",")}`);

  // Body (scripts/templates excluded)
  $("script, style, noscript, template").remove();
  const h1s = $("h1");
  h1s.length === 1 ? pass("one-h1") : fail("one-h1", `${h1s.length} h1`);
  compact(h1s.first().text()) === compact(r.h1)
    ? pass("h1-text")
    : fail("h1-text", h1s.first().text().trim());

  const bodyText = compact($("body").text());
  const headings = $("h1,h2,h3,h4,h5,h6")
    .map((_, el) => ({ level: Number(el.tagName[1]), text: compact($(el).text()) }))
    .get();

  for (const h of ref?.headings ?? []) {
    const t = compact(h.text);
    if (!t) continue;
    const found = headings.filter((x) => x.text === t || x.text.includes(t));
    if (!found.length) fail("headings", `missing "${h.text}"`);
    // The section-8 H1 is promoted from the live page's first heading (often an h2/h3).
    else if (t === compact(r.h1) && found.some((x) => x.level === 1)) pass("headings");
    else if (!found.some((x) => x.level === h.level))
      fail("headings", `"${h.text}" is h${found[0].level}, live h${h.level}`);
    else pass("headings");
  }
  pass("headings");

  for (const p of [...(ref?.paragraphs ?? []), ...(ref?.listItems ?? [])]) {
    const t = compact(p);
    if (t && !bodyText.includes(t)) fail("copy", `missing "${p.slice(0, 70)}"`);
  }
  pass("copy");

  const alts = new Set([
    ...$("img[alt]")
      .map((_, el) => $(el).attr("alt"))
      .get(),
    ...$('[role="img"][aria-label]')
      .map((_, el) => $(el).attr("aria-label"))
      .get(),
  ]);
  for (const a of ref?.imageAlts ?? []) {
    if (a && !alts.has(a)) fail("alts", `missing alt "${a}"`);
  }
  pass("alts");

  for (const id of ANCHORS[r.key] ?? []) {
    $(`#${id}`).length ? pass("anchors") : fail("anchors", `#${id}`);
  }

  const ok = Object.values(checks).every(Boolean);
  if (!ok) failures++;
  rows.push({ path: r.path, result: ok ? "PASS" : "FAIL", checks, notes });
}

// Site files
const sitemap = fs.existsSync(path.join(out, "sitemap.xml"))
  ? fs.readFileSync(path.join(out, "sitemap.xml"), "utf8")
  : "";
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapOk =
  locs.length === routes.length && routes.every((r) => locs.includes(SITE + r.path));
const robots = fs.existsSync(path.join(out, "robots.txt"))
  ? fs.readFileSync(path.join(out, "robots.txt"), "utf8")
  : "";
const robotsOk = robots.includes(`Sitemap: ${SITE}/sitemap.xml`);
const redirectsOk = fs.existsSync(path.join(out, "_redirects"));
if (!sitemapOk || !robotsOk || !redirectsOk) failures++;

// Report
const cols = [
  "title",
  "description",
  "canonical",
  "og",
  "lang",
  "jsonld",
  "one-h1",
  "h1-text",
  "headings",
  "copy",
  "alts",
];
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("route", 58) + cols.map((c) => pad(c.slice(0, 6), 7)).join("") + "result");
for (const row of rows) {
  const cells = cols
    .map((c) => pad(row.checks?.[c] === undefined ? "—" : row.checks[c] ? "ok" : "FAIL", 7))
    .join("");
  console.log(
    pad(row.path.length > 56 ? row.path.slice(0, 53) + "…" : row.path, 58) + cells + row.result,
  );
  if (row.result === "FAIL" || verbose)
    for (const n of row.notes.slice(0, verbose ? 99 : 6)) console.log("    · " + n);
}
console.log(
  `\nsitemap.xml ${sitemapOk ? "ok" : "FAIL"} (${locs.length} urls) · robots.txt ${robotsOk ? "ok" : "FAIL"} · _redirects ${redirectsOk ? "ok" : "FAIL"}`,
);
console.log(`${rows.filter((r) => r.result === "PASS").length}/${rows.length} pages pass`);
process.exitCode = failures ? 1 : 0;
