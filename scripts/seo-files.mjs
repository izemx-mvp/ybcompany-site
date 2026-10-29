// Writes public/sitemap.xml (the 19 canonical routes, trailing slash), public/robots.txt and
// public/_redirects (Cloudflare static assets: 301 non-slash → slash, and the 4 parent pages).
// Run automatically by vite.config.ts at the start of every build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parentRedirects } from "../src/content/site.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://ybcompany.ma";

export function writeSeoFiles(today = new Date().toISOString().slice(0, 10)) {
  const routes = JSON.parse(fs.readFileSync(path.join(root, "src/content/routes.json"), "utf8"));
  const urls = routes
    .map((r) => {
      const depth = r.path === "/" ? 0 : r.path.split("/").filter(Boolean).length;
      const priority = depth === 0 ? "1.0" : depth === 1 ? "0.8" : "0.6";
      return `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
  fs.writeFileSync(path.join(root, "public/sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(root, "public/robots.txt"), robots);

  // Without these, Cloudflare's auto-trailing-slash answers /contact with a 307.
  const lines = routes
    .filter((r) => r.path !== "/")
    .map((r) => `${r.path.slice(0, -1)} ${r.path} 301`);
  for (const [from, to] of Object.entries(parentRedirects))
    lines.push(`${from.slice(0, -1)} ${to} 301`, `${from} ${to} 301`);
  fs.writeFileSync(path.join(root, "public/_redirects"), lines.join("\n") + "\n");
  return routes.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`sitemap.xml: ${writeSeoFiles()} urls`);
}
