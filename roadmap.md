# Roadmap — Redesign ybcompany.ma (YB Company)

SEO-locked redesign: same URLs (trailing slash), titles, metas, headings, body copy, links, alts.
Text is verbatim from the live site, fetched 2026-10-28 by `scripts/extract-live.mjs` into
`scripts/reference/live-reference.json` and mirrored in `src/content/pages/*.ts`. All 19 pages
answered (home and business-model included), so no "TEXTE ORIGINAL À IMPORTER" slots remain.

Stack: TanStack Start (kept from Lovable). Route `head()` + TanStack prerender give the same SEO
outcome the brief describes for react-helmet / vite-react-ssg.

- [x] Fetch all live pages verbatim (19 pages) + reference file for the SEO check
- [x] Design system "L'Atelier — fil d'or sur bleu nuit" (tokens, Cormorant Garamond / Inter, diamond + stitch motifs, grain)
- [x] FX toolkit (src/components/fx): FabricShader, StitchLine, SplitReveal, ClipReveal, StickySteps, PinnedHorizontal, StackCards, Marquee, DiamondGallery + Lightbox, Magnetic + CursorThread, CountUp, ScrollProgress, PageTransition, Lenis; reduced-motion safe; GSAP lazy-loaded
- [x] Content files src/content/pages/*.ts (verbatim text + gallery data)
- [x] Layout: header + mega overlay, mobile menu, footer, breadcrumbs, WhatsApp + chat launcher, 404
- [x] All 19 routes + 4 parent redirects, head() per route, JSON-LD (Organization + LocalBusiness / BreadcrumbList)
- [x] Prerender (19 pages), sitemap.xml, robots.txt, _redirects (301 non-slash → slash)
- [x] Contact form → `prospects` (Lovable Cloud), file upload to private `uploads` bucket
- [x] Assistant YB: edge function (Lovable AI gateway, SSE, search_site + create_lead), migration, lazy panel, CHATBOT.md
- [x] Image slots + manifest: `<Img>` placeholders, download script, IMAGES.md (LIVE vs GENERATE)
- [x] Verify: build (0 TS errors), seo-check 19/19, unit tests, Playwright 38/38, Lighthouse mobile
- [x] Live images downloaded (367/367, responsive WebP + AVIF), 12 generated images processed and mapped (IMAGES.md); 0 placeholders left
- [x] Logos from the client's files src/assets/yb-logo-{color,white}.png (transparent, trimmed: scripts/process-logos.mjs)
- [x] Ad-blocker safe: no requested file path contains publicite / pub / banner / affiche… (renamed sources + 70 images, hash-only chunk names; browser-check + uBlock Origin check)
- [ ] Real WhatsApp number in `src/content/site.ts`
- [ ] Enable Lovable Cloud, run the migration, deploy the `chat` function (CHATBOT.md)
- [ ] Lighthouse performance ≥ 85 (currently 80–83 simulated; see notes in the final report)
