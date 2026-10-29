#!/usr/bin/env node
// Extracts the verbatim SEO reference + live image list from ybcompany.ma.
//
//   node scripts/extract-live.mjs            # uses cached HTML in scripts/.cache/live
//   node scripts/extract-live.mjs --fetch    # re-downloads the 19 live pages first
//
// Outputs (committed):
//   scripts/reference/live-reference.json  — per route: title, meta, headings, paragraphs, list items, alts, links
//   src/content/live-images.json           — per page: ordered images {id, url, original, alt, file, group}
//
// The download script (scripts/download-live-images.mjs) later adds w/h/ok to live-images.json.
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { neutralFile } from "./neutral-paths.mjs";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "..",
);
const cacheDir = path.join(root, "scripts/.cache/live");
const routes = JSON.parse(fs.readFileSync(path.join(root, "src/content/routes.json"), "utf8"));
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36";

const cacheName = (p) =>
  (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "__")) + ".html";
const norm = (s) => (s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();

export function slugify(s) {
  return norm(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

// Strip WordPress "-300x300" style size suffixes to get the original upload.
const originalOf = (u) => u.replace(/-\d{2,4}x\d{2,4}(_c)?(\.[a-z]+)$/i, "$2");

async function main() {
  fs.mkdirSync(cacheDir, { recursive: true });
  if (process.argv.includes("--fetch")) {
    for (const r of routes) {
      const res = await fetch("https://ybcompany.ma" + r.path, { headers: { "user-agent": UA } });
      fs.writeFileSync(path.join(cacheDir, cacheName(r.path)), await res.text());
      console.log(res.status, r.path);
    }
  }

  const reference = {};
  const images = {};

  for (const r of routes) {
    const html = fs.readFileSync(path.join(cacheDir, cacheName(r.path)), "utf8");
    const $ = cheerio.load(html);
    const main = $(".rst-main-page");
    // Visual-builder chrome that is not content.
    main
      .find(".elementor-screen-only, .elementor-counter-number, script, style, noscript, form")
      .remove();
    main.find("br").replaceWith(" ");

    const headings = main
      .find("h1,h2,h3,h4,h5,h6")
      .map((_, e) => ({ level: +e.tagName[1], text: norm($(e).text()) }))
      .get()
      .filter((h) => h.text);
    const paragraphs = main
      .find("p")
      .map((_, e) => norm($(e).text()))
      .get()
      .filter(Boolean);
    const listItems = main
      .find("li")
      .map((_, e) => norm($(e).text()))
      .get()
      .filter(Boolean);
    const links = main
      .find("a[href]")
      .map((_, e) => ({ text: norm($(e).text()), href: $(e).attr("href") }))
      .get()
      .filter((l) => l.text && !l.href.startsWith("javascript"));

    const list = [];
    const seen = new Map();
    const push = (e, id, group) => {
      const $e = $(e);
      const src = $e.attr("data-src") || $e.attr("src");
      if (!src) return;
      const parentHref = $e.closest("a").attr("href");
      let best = parentHref && /\.(jpe?g|png|gif|webp)$/i.test(parentHref) ? parentHref : null;
      const srcset = $e.attr("srcset");
      if (!best && srcset) {
        const c = srcset.split(",").map((s) => s.trim().split(/\s+/));
        c.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        best = c[0][0];
      }
      const url = (best || src).replace(/^http:/, "https:");
      const alt = $e.attr("alt") ?? "";
      let base = slugify(alt) || slugify(path.basename(url).replace(/\.[a-z]+$/i, "")) || "image";
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      if (n > 1) base = `${base}-${n}`;
      const ext = path.extname(new URL(url).pathname).toLowerCase() || ".jpg";
      list.push({
        id,
        group,
        url,
        original: originalOf(url),
        alt,
        // Alt slug, unless it contains a word ad blockers filter (neutral-paths.mjs).
        file: neutralFile(r.key, id, base),
        sourceExt: ext,
      });
    };

    $("header .revslides img").each((i, e) =>
      push(e, `${r.key}-banner${i ? "-" + (i + 1) : ""}`, "banner"),
    );

    // Walk the main content in document order and tag each image with the last text label seen.
    let group = "";
    let idx = 0;
    main.find("h1,h2,h3,h4,h5,h6,p,img,.elementor-tab-title").each((_, e) => {
      if (e.tagName === "img") {
        idx += 1;
        push(e, `${r.key}-${String(idx).padStart(2, "0")}`, group);
      } else {
        const t = norm($(e).text());
        if (t && t.length < 120) group = t;
      }
    });

    images[r.key] = list;
    reference[r.path] = {
      key: r.key,
      live: {
        title: norm($("title").text()),
        description: $('meta[name="description"]').attr("content") ?? null,
        canonical: $('link[rel="canonical"]').attr("href") ?? null,
        ogImage: $('meta[property="og:image"]').attr("content") ?? null,
      },
      expected: { title: r.title, h1: r.h1, description: r.description },
      headings,
      paragraphs,
      listItems,
      imageAlts: list.map((i) => i.alt).filter(Boolean),
      links,
    };
  }

  fs.mkdirSync(path.join(root, "scripts/reference"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "scripts/reference/live-reference.json"),
    JSON.stringify(reference, null, 2) + "\n",
  );

  // Preserve w/h/ok written by the download script.
  const imgPath = path.join(root, "src/content/live-images.json");
  const prev = fs.existsSync(imgPath) ? JSON.parse(fs.readFileSync(imgPath, "utf8")) : {};
  for (const [k, list] of Object.entries(images)) {
    for (const im of list) {
      const old = prev[k]?.find((p) => p.id === im.id && p.url === im.url);
      if (old?.ok) Object.assign(im, { w: old.w, h: old.h, ok: true });
    }
  }
  fs.writeFileSync(imgPath, JSON.stringify(images, null, 1) + "\n");

  const total = Object.values(images).reduce((n, l) => n + l.length, 0);
  console.log(`reference: ${routes.length} routes · images: ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
