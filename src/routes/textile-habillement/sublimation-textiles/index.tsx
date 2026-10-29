import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { liveRange } from "@/lib/images";
import { sublimation as s } from "@/content/pages/textile";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { DiamondGallery, SplitReveal, StitchLine } from "@/components/fx";
import { SocialRow } from "@/components/sections/blocks";

export const Route = createFileRoute("/textile-habillement/sublimation-textiles/")({
  head: () => pageHead("sublimation"),
  component: Sublimation,
});

function NumberedRows({ items, start = 1 }: { items: string[]; start?: number }) {
  return (
    <ul className="border-t border-ink/15">
      {items.map((it, i) => (
        <li
          key={it}
          className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-b border-ink/15 py-6 md:grid-cols-[6rem_1fr] md:py-8"
        >
          <span className="numeral text-3xl text-navy md:text-5xl" aria-hidden="true">
            {String(start + i).padStart(2, "0")}
          </span>
          <span className="display display-s text-ink">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Sublimation() {
  return (
    <>
      <PageHero pageKey="sublimation" title={s.h1} />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12 gap-y-14">
          <div className="prose-atelier col-span-12 space-y-6 text-lg leading-[1.85] text-ink/85 lg:col-span-6 lg:col-start-2">
            {s.intro.map((p, i) => (
              <Rich
                key={i}
                as="p"
                html={p}
                className={i === 0 ? "display display-s !leading-snug text-ink" : undefined}
              />
            ))}
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-24">
            <NumberedRows items={s.clients} />
          </div>
        </div>
      </section>

      <section className="scene-night grain py-24 md:py-32">
        <div className="wrap relative z-[2] grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <SplitReveal as="h2" text={s.h2a} className="display display-l text-cotton" />
            <SplitReveal
              as="h2"
              text={s.h2b}
              className="display display-l mt-2 italic text-gold-soft"
            />
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <Rich as="p" html={s.productsIntro} className="lede mb-10 text-cotton/85" />
            <ul className="border-t border-cotton/15">
              {s.products.map((p, i) => (
                <li
                  key={p}
                  className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-b border-cotton/15 py-6"
                >
                  <span className="numeral text-3xl" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="display display-s">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="scene-day py-24 md:py-32">
        <div className="wrap">
          <StitchLine className="mb-16 h-6 w-full" />
          <DiamondGallery
            groups={[{ key: "sublimation", label: s.h1, images: liveRange("sublimation", 1, 14) }]}
            filters={false}
            columns="4"
          />
          <SocialRow pageKey="sublimation" className="mt-24" />
        </div>
      </section>
    </>
  );
}
