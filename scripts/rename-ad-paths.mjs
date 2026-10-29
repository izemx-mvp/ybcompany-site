// One-off migration: renames every image under public/images whose path contains a word ad
// blockers filter (see neutral-paths.mjs) to a neutral name, with all its -<w>.webp / .avif
// variants and the og image, updates live-images.json and records old → new in
// src/content/image-renames.json (listed in IMAGES.md).   node scripts/rename-ad-paths.mjs
// Plans every rename first (no clash allowed), then moves; safe to re-run after an interruption.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AD_WORDS, imageDir, neutralFile } from "./neutral-paths.mjs";
import { syncImages } from "./sync-images.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const LIVE = path.join(root, "src/content/live-images.json");
const RENAMES = path.join(root, "src/content/image-renames.json");
const live = JSON.parse(fs.readFileSync(LIVE, "utf8"));
const renames = fs.existsSync(RENAMES) ? JSON.parse(fs.readFileSync(RENAMES, "utf8")) : [];

// Plan.
const plan = [];
const taken = new Set(Object.values(live).flat().map((im) => im.file));
for (const [key, list] of Object.entries(live)) {
  for (const im of list) {
    if (!AD_WORDS.test(im.file)) continue;
    const next = neutralFile(key, im.id, path.basename(im.file, ".webp"));
    if (taken.has(next) || AD_WORDS.test(next)) throw new Error(`bad target: ${next}`);
    taken.add(next);
    plan.push({ im, from: im.file, to: next });
  }
}

const move = (from, to) => {
  const a = path.join(pub, from);
  const b = path.join(pub, to);
  if (!fs.existsSync(a)) return false;
  fs.mkdirSync(path.dirname(b), { recursive: true });
  fs.renameSync(a, b);
  return true;
};

// Move the original and its width variants (3–4 digits). Slugs are [a-z0-9-] and "-2.webp" can be
// another image's name (alt duplicates), so nothing else is touched.
for (const { im, from, to } of plan) {
  const oldStem = from.replace(/\.webp$/, "");
  const newStem = to.replace(/\.webp$/, "");
  const base = path.basename(oldStem);
  const dir = path.join(pub, path.dirname(from));
  const tails = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.startsWith(base)).map((f) => f.slice(base.length))
    : [];
  for (const tail of tails)
    if (tail === ".webp" || /^-\d{3,4}\.(webp|avif)$/.test(tail))
      move(`${oldStem}${tail}`, `${newStem}${tail}`);
  if (!fs.existsSync(path.join(pub, to))) throw new Error(`missing after move: ${to}`);
  renames.push({ from, to });
  im.file = to;
}

for (const key of Object.keys(live)) {
  const dirName = imageDir(key);
  if (dirName !== key && move(`images/og/${key}.jpg`, `images/og/${dirName}.jpg`))
    renames.push({ from: `/images/og/${key}.jpg`, to: `/images/og/${dirName}.jpg` });
}

// Remove emptied folders.
for (const d of fs.readdirSync(path.join(pub, "images"))) {
  const p = path.join(pub, "images", d);
  if (fs.statSync(p).isDirectory() && !fs.readdirSync(p).length) fs.rmdirSync(p);
}

fs.writeFileSync(LIVE, JSON.stringify(live, null, 1) + "\n");
fs.writeFileSync(RENAMES, JSON.stringify(renames, null, 1) + "\n");
syncImages();
console.log(`renamed ${plan.length} images (with variants)`);
