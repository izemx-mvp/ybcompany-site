# Roadmap — Redesign ybcompany.ma (YB Company)

SEO-locked redesign: same URLs, titles, metas, headings, body copy, links, alts.
Text = verbatim from live site (fetched 2026-10-28 into /tmp/fetched, mirrored in
src/content/pages/*.ts). Home + Business Model pages currently return a live DB
error → text slots hold "TEXTE ORIGINAL À IMPORTER".

- [x] Fetch all live pages verbatim (19 pages; home + business-model fail upstream)
- [ ] Design system (colors, Cormorant Garamond/Inter, diamond + stitch motifs)
- [ ] Assets: color/white logo pointers, favicon from diamond, generated photoreal images
- [ ] Content files src/content/pages/*.ts (verbatim text + gallery data)
- [ ] Global components: header mega-menu, mobile drawer, footer, WhatsApp, breadcrumbs, carousel, lightbox/masonry, stitch divider, reveal/count-up, contact form
- [ ] All 19 routes + 404, head() per route, redirects
- [ ] Prerender, sitemap.xml, robots.txt, JSON-LD
- [ ] Build, verify with Playwright, check observability logs

Stack note: brief says react-router + react-helmet-async + vite-react-ssg; project
stack is TanStack Start — same SEO outcomes delivered with route head() + TanStack
prerender. Recorded in AGENTS.md.
