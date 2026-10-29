// Converts the generated ambience JPGs (src/assets/*.jpg, originals left untouched and never
// imported by the app) into responsive WebP at 640/1024/1600/2400 + AVIF at 1600 in
// public/images/generated/, writes public/og-image.jpg (1200×630) from home-hero, and records
// the source sizes in src/content/generated-images.json.
//   node scripts/process-generated-images.mjs [--force]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { syncImages } from "./sync-images.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "src/assets");
const OUT = path.join(root, "public/images/generated");
const WIDTHS = [640, 1024, 1600, 2400];
const AVIF_WIDTH = 1600;
const force = process.argv.includes("--force");

fs.mkdirSync(OUT, { recursive: true });
const dims = {};
const files = fs.readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f));
const fresh = (out, src) => !force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;

for (const f of files) {
  const src = path.join(SRC, f);
  const stem = path.parse(f).name;
  const meta = await sharp(src).metadata();
  dims[stem] = { w: meta.width, h: meta.height };
  for (const w of WIDTHS) {
    const out = path.join(OUT, `${stem}-${w}.webp`);
    if (!fresh(out, src)) await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  }
  const avif = path.join(OUT, `${stem}-${AVIF_WIDTH}.avif`);
  if (!fresh(avif, src)) await sharp(src).resize({ width: AVIF_WIDTH, withoutEnlargement: true }).avif({ quality: 50 }).toFile(avif);
  console.log(`✓ ${stem}`);
}

// Default og:image (16:9 → 1.91:1 only trims top and bottom).
const hero = path.join(SRC, "home-hero.jpg");
if (fs.existsSync(hero)) {
  await sharp(hero).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(root, "public/og-image.jpg"));
  console.log("✓ public/og-image.jpg");
}

// Source dimensions, used by sync-images to build srcset/aspect ratios.
fs.writeFileSync(path.join(root, "src/content/generated-images.json"), JSON.stringify(dims, null, 1) + "\n");
syncImages();
