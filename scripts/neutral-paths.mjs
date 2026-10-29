// Ad blockers (uBlock / AdBlock, EasyList) drop any request whose path contains ad-related words,
// so no file the browser loads may carry them in its path. Page URLs are exempt (SEO-locked).
// Shared by extract-live (new image names), the one-off rename migration and browser-check.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = JSON.parse(fs.readFileSync(path.join(root, "src/content/image-dirs.json"), "utf8"));

/** Matches the words EasyList-style filters block. */
export const AD_WORDS = /(publicit|\bpub\b|advert|\bads?\b|banner|affiche|sponsor|promo)/i;

/** public/images/<dir> (and og file name) for a page key. */
export const imageDir = (key) => dirs[key] ?? key;

// Neutral file prefix per page, used when an alt-derived name contains a filtered word.
const PREFIX = {
  structures: "support",
  "grand-format": "impression",
  "sac-non-tisse": "sac",
  "sac-tissu": "sac",
  "partenaires-pub": "logo",
  home: "visuel",
};

/**
 * Image file path for a live image: /images/<dir>/<base>.webp, where base is the alt slug unless
 * it contains a filtered word, in which case <prefix>-<id suffix> (e.g. structures-08 → stand-08).
 */
export function neutralFile(key, id, base) {
  if (AD_WORDS.test(base)) {
    const suffix = id.slice(key.length + 1).replace(/banner/g, "bandeau");
    base = `${PREFIX[key] ?? "visuel"}-${suffix}`;
  }
  return `/images/${imageDir(key)}/${base}.webp`;
}
