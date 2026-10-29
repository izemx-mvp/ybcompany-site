// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import routes from "./src/content/routes.json";
// @ts-expect-error — plain .mjs build scripts
import { syncImages } from "./scripts/sync-images.mjs";
// @ts-expect-error — plain .mjs build scripts
import { writeSeoFiles } from "./scripts/seo-files.mjs";

// Before modules load: flag image slots whose file exists in public/ (placeholder otherwise),
// and regenerate sitemap.xml + robots.txt from src/content/routes.json.
syncImages();
writeSeoFiles();

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Every page is prerendered to static HTML so all copy is in the initial response.
    prerender: { enabled: true, crawlLinks: false, autoSubfolderIndex: true, failOnError: true },
    pages: routes.map((r) => ({ path: r.path })),
  },
  vite: {
    environments: {
      client: {
        build: {
          rollupOptions: {
            // Hash-only names: a chunk named after a source file or route (e.g. "publicite-…js")
            // is dropped by ad blockers (EasyList), which breaks the page.
            output: {
              entryFileNames: "assets/[hash].js",
              chunkFileNames: "assets/[hash].js",
              assetFileNames: "assets/[hash][extname]",
            },
          },
        },
      },
    },
  },
});
