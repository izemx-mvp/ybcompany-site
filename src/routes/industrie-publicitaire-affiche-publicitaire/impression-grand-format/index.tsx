import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { liveRange } from "@/lib/images";
import { grandFormat as g } from "@/content/pages/impression-signaletique";
import { PageHero } from "@/components/layout/PageHero";
import { H, Rich } from "@/components/layout/Rich";
import { Img } from "@/components/media/Img";
import { DiamondGallery, SplitReveal, StackCards, StitchLine } from "@/components/fx";
import { SocialRow } from "@/components/sections/blocks";

export const Route = createFileRoute(
  "/industrie-publicitaire-affiche-publicitaire/impression-grand-format/",
)({
  head: () => pageHead("grand-format"),
  component: GrandFormat,
});

function GrandFormat() {
  return (
    <>
      <PageHero pageKey="grand-format" title={g.h1} />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <SplitReveal as="h2" text={g.h2} className="display display-m max-w-[10ch] text-navy" />
            <h4 className="label mt-10 inline-flex items-center gap-3 text-navy">
              <span className="size-1.5 rotate-45 bg-gold" aria-hidden="true" />
              {g.h4}
            </h4>
          </div>
          <div className="prose-atelier col-span-12 space-y-6 lg:col-span-7 lg:col-start-6">
            {g.paragraphs.map((p, i) => (
              <Rich
                key={i}
                as="p"
                html={p}
                className={
                  i === 0 ? "display display-s !leading-snug text-ink" : "lede text-ink/80"
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* The four supports, stacked */}
      <StackCards
        panels={g.supports.map((s, i) => {
          const imgs = liveRange("grand-format", s.images[0], s.images[1]);
          const night = i % 2 === 0;
          return {
            key: s.key,
            className: night ? "scene-night" : "scene-day border-t border-ink/10",
            content: (
              <div className="wrap grid-12 h-full items-center gap-y-8 py-[calc(var(--header-h)+1rem)]">
                <div className="col-span-12 md:col-span-6">
                  <span className="numeral mb-4 block text-5xl md:text-7xl" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <H
                    level={2}
                    html={s.html}
                    className={`display display-l mb-8 ${night ? "text-cotton" : "text-navy"}`}
                  />
                  <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    {s.items.map((it) => (
                      <li
                        key={it}
                        className={`flex items-center gap-3 border-b py-2.5 ${night ? "border-cotton/15 text-cotton/90" : "border-ink/12 text-ink/85"}`}
                      >
                        <span className="size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-12 hidden md:col-span-5 md:col-start-8 md:block">
                  {imgs[0] && <Img image={imgs[0]} ratio={4 / 5} className="max-h-[60vh]" />}
                </div>
              </div>
            ),
          };
        })}
      />

      <section className="scene-day relative z-10 py-24 md:py-32">
        <div className="wrap">
          <StitchLine className="mb-16 h-6 w-full" />
          <DiamondGallery
            columns="4"
            groups={g.supports.map((s) => ({
              key: s.key,
              label: s.html.replace("<br>", " "),
              images: liveRange("grand-format", s.images[0], s.images[1]),
            }))}
          />
          <SocialRow pageKey="grand-format" className="mt-24" />
        </div>
      </section>
    </>
  );
}
