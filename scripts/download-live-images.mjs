// Downloads every image referenced by the live site (src/content/live-images.json), converts it
// to WebP with sharp (max 2000px wide, q80), records its real width/height, and writes the
// responsive variants <slug>-<640|1024|1600>.webp (narrower than the original only) and one
// <slug>-<w>.avif (w = min(width, 1600)). Also fetches the
// live og:images (→ public/images/og/<dir>.jpg, see neutral-paths.mjs, 1200×630). The logos come from src/assets
// (scripts/process-logos.mjs).
//   node scripts/download-live-images.mjs [--force] [--only=<pageKey>]
// Existing files are skipped unless --force. Finishes by running sync-images (ok flags).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { imageDir } from "./neutral-paths.mjs";
import { syncImages } from "./sync-images.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const LIVE = path.join(root, "src/content/live-images.json");
const ROUTES = path.join(root, "src/content/routes.json");
const force = process.argv.includes("--force");
const WIDTHS = [640, 1024, 1600];
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (YB Company redesign asset sync)" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function firstOk(urls) {
  let last;
  for (const u of [...new Set(urls.filter(Boolean))]) {
    try {
      return await fetchBuffer(u);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

const live = JSON.parse(fs.readFileSync(LIVE, "utf8"));
const jobs = Object.entries(live)
  .filter(([key]) => !only || key === only)
  .flatMap(([, list]) => list);
let done = 0;
const failed = [];

await pool(jobs, 6, async (im) => {
  const out = path.join(pub, im.file.replace(/^\//, ""));
  try {
    if (force || !fs.existsSync(out)) {
      const buf = await firstOk([im.original, im.url]);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await sharp(buf)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out);
    }
    const meta = await sharp(out).metadata();
    im.w = meta.width;
    im.h = meta.height;
    const stem = out.replace(/\.webp$/, "");
    for (const w of WIDTHS.filter((w) => w < meta.width)) {
      if (force || !fs.existsSync(`${stem}-${w}.webp`)) await sharp(out).resize({ width: w }).webp({ quality: 78 }).toFile(`${stem}-${w}.webp`);
    }
    const aw = Math.min(meta.width, 1600);
    if (force || !fs.existsSync(`${stem}-${aw}.avif`)) await sharp(out).resize({ width: aw }).avif({ quality: 50 }).toFile(`${stem}-${aw}.avif`);
    done++;
  } catch (e) {
    failed.push(`${im.id}: ${e.message}`);
  }
});
fs.writeFileSync(LIVE, JSON.stringify(live, null, 1) + "\n");

// og:images
const routes = JSON.parse(fs.readFileSync(ROUTES, "utf8"));
for (const r of routes) {
  if (!r.ogImage || (only && r.key !== only)) continue;
  const out = path.join(pub, "images/og", `${imageDir(r.key)}.jpg`);
  if (!force && fs.existsSync(out)) continue;
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(await fetchBuffer(r.ogImage))
      .resize(1200, 630, { fit: "cover" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
  } catch (e) {
    failed.push(`og ${r.key}: ${e.message}`);
  }
}

const s = syncImages();
console.log(`downloaded/verified ${done}/${jobs.length} · live ok ${s.liveOk}/${s.liveTotal}`);
if (failed.length) {
  console.log(`failed (${failed.length}):\n  ` + failed.join("\n  "));
  process.exitCode = 1;
}
