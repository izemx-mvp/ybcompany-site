// Brand logos from the client's files src/assets/yb-logo-{color,white}.png (originals untouched,
// never imported by the app). Both are flat images on an opaque background (white behind the
// color logo, navy #1c2d40 behind the white one), so the background is turned into transparency,
// the margins trimmed and the result resized for the header/footer:
//   public/brand/yb-logo-<variant>.png (palette PNG, smaller than WebP here), 240 px tall (≈ 4× the 56 px display height)
// and the sizes recorded in src/content/brand.json (Logo width/height).
//   node scripts/process-logos.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "public/brand");
const HEIGHT = 240;
fs.mkdirSync(OUT, { recursive: true });

// Alpha from the distance to the background colour; colour un-blended from the background so
// anti-aliased edges keep their real hue. `full` = distance at which a pixel is fully opaque;
// below NOISE the pixel is background (the files carry a few levels of compression noise).
const NOISE = 12;
function knockOut(data, channels, bg, full) {
  const out = Buffer.alloc((data.length / channels) * 4);
  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const c = [data[i], data[i + 1], data[i + 2]];
    const d = Math.max(...c.map((v, k) => Math.abs(v - bg[k])));
    const a = d <= NOISE ? 0 : Math.min(1, (d - NOISE) / (full - NOISE));
    for (let k = 0; k < 3; k++)
      out[o + k] = a > 0 ? Math.max(0, Math.min(255, Math.round((c[k] - bg[k] * (1 - a)) / a))) : 0;
    out[o + 3] = Math.round(a * 255);
  }
  return out;
}

const dims = {};
for (const variant of ["color", "white"]) {
  const src = path.join(root, `src/assets/yb-logo-${variant}.png`);
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const bg = [data[0], data[1], data[2]]; // top-left pixel = background
  const rgba = knockOut(data, info.channels, bg, variant === "color" ? 120 : 160);
  const trimmed = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
  const img = sharp(trimmed.data, {
    raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 },
  }).resize({ height: HEIGHT });
  const base = path.join(OUT, `yb-logo-${variant}`);
  const { width, height } = await img.clone().png({ compressionLevel: 9, palette: true }).toFile(`${base}.png`);
  dims[variant] = { w: width, h: height };
  console.log(`✓ public/brand/yb-logo-${variant}.png ${width}×${height}`);
}
fs.writeFileSync(path.join(root, "src/content/brand.json"), JSON.stringify(dims, null, 1) + "\n");
