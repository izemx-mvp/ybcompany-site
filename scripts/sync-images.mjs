// Builds src/content/images.gen.json, the image table the site bundles, from:
//   - live-images.json (the client's real photos, fetched by download-live-images.mjs),
//   - generated-images.json (the generated set, processed by process-generated-images.mjs),
//   - image-map.json (which image each hero and visual slot uses, plus focal points).
// Each record lists the responsive files found on disk (WebP srcset, AVIF) and `ok` = the
// file exists; slots without a file render the navy placeholder. Run automatically by
// vite.config.ts before each dev/build, or by hand:   node scripts/sync-images.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const LIVE = path.join(root, "src/content/live-images.json");
const GEN = path.join(root, "src/content/images.gen.json");
const GENERATED_WIDTHS = [640, 1024, 1600, 2400];

const exists = (file) => fs.existsSync(path.join(pub, file.replace(/^\//, "")));

function writeIfChanged(file, data) {
  const next = JSON.stringify(data, null, 1) + "\n";
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== next) fs.writeFileSync(file, next);
}

// Responsive variants written next to a live file by download-live-images.mjs:
// <stem>-<640|1024|1600>.webp (narrower than the original) and <stem>-<min(w,1600)>.avif.
// Records carry only the widths; the client derives the file names (src/lib/images.ts).
const LIVE_WIDTHS = [640, 1024, 1600];

function liveRecord(im) {
  const ok = exists(im.file);
  const rec = { id: im.id, file: im.file, alt: im.alt ?? "", ok };
  if (im.w && im.h) Object.assign(rec, { w: im.w, h: im.h });
  if (ok && im.w) {
    const stem = im.file.replace(/\.webp$/, "");
    rec.vw = LIVE_WIDTHS.filter((w) => w < im.w && exists(`${stem}-${w}.webp`));
    const aw = Math.min(im.w, 1600);
    if (exists(`${stem}-${aw}.avif`)) rec.aw = aw;
  }
  return rec;
}

function generatedRecord(name, dims, focal) {
  const d = dims[name];
  const stem = `/images/generated/${name}`;
  const file = `${stem}-1600.webp`;
  const rec = { id: `gen-${name}`, file, alt: "", ok: exists(file), pos: focal[name] ?? focal.default };
  if (d) Object.assign(rec, { w: 1600, h: Math.round((1600 * d.h) / d.w) });
  if (rec.ok) {
    rec.stem = stem;
    rec.vw = GENERATED_WIDTHS.filter((w) => exists(`${stem}-${w}.webp`));
    if (exists(`${stem}-1600.avif`)) rec.aw = 1600;
  }
  return rec;
}

export function syncImages() {
  const live = JSON.parse(fs.readFileSync(LIVE, "utf8"));
  const dims = fs.existsSync(path.join(root, "src/content/generated-images.json"))
    ? read("src/content/generated-images.json")
    : {};
  const map = read("src/content/image-map.json");
  const ambience = read("src/content/ambience-images.json");

  let liveOk = 0;
  let liveTotal = 0;
  for (const list of Object.values(live)) {
    for (const im of list) {
      liveTotal++;
      im.ok = exists(im.file);
      if (im.ok) liveOk++;
    }
  }
  writeIfChanged(LIVE, live);

  const liveById = new Map(
    Object.values(live)
      .flat()
      .map((im) => [im.id, im]),
  );
  const resolve = (ref) => {
    const [kind, id] = ref.split(":");
    if (kind === "gen") return generatedRecord(id, dims, map.focal);
    const im = liveById.get(id);
    if (!im) throw new Error(`image-map: unknown live image ${id}`);
    return liveRecord(im);
  };

  const slots = {};
  for (const a of ambience) {
    const ref = map.slots[a.id];
    // Unmapped slot: keep the placeholder at its planned size.
    slots[a.id] = ref ? resolve(ref) : { id: a.id, file: a.file, alt: "", w: a.w, h: a.h, ok: false };
  }
  for (const [id, ref] of Object.entries(map.slots)) slots[id] ??= resolve(ref);
  const heroes = Object.fromEntries(Object.entries(map.heroes).map(([k, ref]) => [k, resolve(ref)]));

  writeIfChanged(GEN, {
    live: Object.fromEntries(Object.entries(live).map(([k, list]) => [k, list.map(liveRecord)])),
    slots,
    heroes,
  });
  const all = [...Object.values(slots), ...Object.values(heroes)];
  return { liveOk, liveTotal, slotsOk: all.filter((s) => s.ok).length, slotsTotal: all.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = syncImages();
  console.log(`live ${r.liveOk}/${r.liveTotal} · mapped slots + heroes ${r.slotsOk}/${r.slotsTotal}`);
}
