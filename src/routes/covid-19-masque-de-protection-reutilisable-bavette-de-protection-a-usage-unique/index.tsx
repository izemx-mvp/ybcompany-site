import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";
import { liveImage } from "@/lib/images";
import { masques as m } from "@/content/pages/protection";
import { PageHero } from "@/components/layout/PageHero";
import { Img } from "@/components/media/Img";
import { ClipReveal, DiamondGallery, SplitReveal, StitchLine } from "@/components/fx";
import { rangeImages } from "@/components/sections/blocks";
import { TechPack } from "@/components/sections/TechPack";

export const Route = createFileRoute(
  "/covid-19-masque-de-protection-reutilisable-bavette-de-protection-a-usage-unique/",
)({
  head: () => pageHead("masques"),
  component: Masques,
});

function Masques() {
  return (
    <>
      <PageHero pageKey="masques" title={m.h1}>
        <p className="lede mt-10 max-w-3xl text-cotton/85">{m.paragraph}</p>
      </PageHero>

      <section className="scene-day py-24 md:py-32">
        <div className="wrap">
          <SplitReveal
            as="h2"
            text={m.typesTitle}
            className="display display-l mb-16 max-w-[18ch] text-navy"
          />
          <StitchLine className="mb-16 h-6 w-full" />
          {m.products.map((p, i) => (
            <article
              key={p.title}
              className={cn(
                "grid-12 items-center gap-y-10 py-16 md:py-24",
                i > 0 && "border-t border-ink/10",
              )}
            >
              <div
                className={cn(
                  "col-span-12 md:col-span-5",
                  i % 2 === 1 && "md:order-2 md:col-start-8",
                )}
              >
                <ClipReveal className="aspect-square">
                  <Img image={liveImage(p.image)} fill />
                </ClipReveal>
              </div>
              <div
                className={cn(
                  "col-span-12 md:col-span-6",
                  i % 2 === 0 ? "md:col-start-7" : "md:order-1 md:col-start-1",
                )}
              >
                <span className="numeral mb-4 block text-5xl" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="display display-m mb-10 text-navy">{p.title}</h2>
                <TechPack title={<p>{p.specTitle}</p>} specs={p.specs} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="scene-night grain py-24 md:py-32">
        <div className="wrap relative z-[2]">
          <DiamondGallery
            tone="night"
            columns="4"
            filters={false}
            groups={[
              { key: "masques", label: m.typesTitle, images: rangeImages("masques", m.gallery) },
            ]}
          />
        </div>
      </section>
    </>
  );
}
