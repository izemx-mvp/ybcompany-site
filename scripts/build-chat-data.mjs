#!/usr/bin/env node
// Generates the chatbot's embedded data from the site sources:
//   supabase/functions/chat/search-index.json  ← src/content/routes.json + scripts/reference/live-reference.json
//   supabase/functions/chat/site-facts.json    ← src/content/site.ts (single source of company facts)
// Also exported as buildSearchIndex() for the Vite plugin (public /search-index.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function buildSearchIndex() {
  const routes = JSON.parse(fs.readFileSync(path.join(root, "src/content/routes.json"), "utf8"));
  const ref = JSON.parse(
    fs.readFileSync(path.join(root, "scripts/reference/live-reference.json"), "utf8"),
  );
  return routes.map((r) => {
    const page = ref[r.path] ?? { headings: [], paragraphs: [], listItems: [] };
    const headings = page.headings.map((h) => h.text).filter((t) => t !== r.h1);
    const body = [...page.paragraphs, ...page.listItems].join(" ").replace(/\s+/g, " ").trim();
    const excerptSrc = r.description || page.paragraphs.find((p) => p.length > 60) || body;
    return {
      key: r.key,
      path: r.path,
      title: r.title,
      h1: r.h1,
      headings,
      excerpt:
        excerptSrc.length > 220
          ? excerptSrc.slice(0, 217).replace(/\s+\S*$/, "") + "…"
          : excerptSrc,
      text: [headings.join(". "), body].filter(Boolean).join(". ").slice(0, 4000),
    };
  });
}

export async function buildSiteFacts() {
  const { site, activities } = await import(
    pathToFileURL(path.join(root, "src/content/site.ts")).href
  );
  return {
    name: site.name,
    phone: site.phone,
    email: site.email,
    address: site.address,
    whatsapp: site.whatsapp,
    activities: [...activities],
    contacts: site.contacts.map((c) => ({ ...c })),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = path.join(root, "supabase/functions/chat");
  fs.writeFileSync(
    path.join(dir, "search-index.json"),
    JSON.stringify(buildSearchIndex(), null, 1) + "\n",
  );
  fs.writeFileSync(
    path.join(dir, "site-facts.json"),
    JSON.stringify(await buildSiteFacts(), null, 2) + "\n",
  );
  console.log("chat data written to supabase/functions/chat/");
}
