import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { ambienceImage, liveImage, liveRange } from "@/lib/images";
import { sportCasual as c } from "@/content/pages/textile";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { Img } from "@/components/media/Img";
import { ClipReveal, DiamondGallery, SplitReveal, StitchLine } from "@/components/fx";
import { HoverList } from "@/components/sections/HoverList";
import { Kicker, SocialRow, ThreadLink } from "@/components/sections/blocks";

export const Route = createFileRoute("/textile-habillement/habillement-textile-sport-casual/")({
  head: () => pageHead("sport-casual"),
  component: SportCasual,
});

function SportCasual() {
  return (
    <>
      <PageHero pageKey="sport-casual" title={c.h1} />

      {/* Editorial split */}
      <section className="scene-day py-24 md:py-36">
        <div className="wrap grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <h3 className="mb-12">
              <Kicker>{c.kicker}</Kicker>
            </h3>
            <div className="prose-atelier space-y-6 text-lg leading-[1.85] text-ink/85">
              {c.paragraphs.map((p, i) => (
                <Rich
                  key={i}
                  as="p"
                  html={p}
                  className={
                    i === 0
                      ? "display display-s !leading-snug text-ink [&_strong]:font-semibold"
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-5 lg:col-start-8">
            <div className="lg:sticky lg:top-28">
              <ClipReveal className="aspect-[4/5]">
                <Img image={ambienceImage("sc-intro")} fill />
              </ClipReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Sports as an interactive list */}
      <section className="scene-night grain py-24 md:py-32">
        <div className="wrap relative z-[2]">
          <HoverList
            tone="night"
            items={c.sports.map((s) => ({
              key: s.html,
              title: <Rich html={s.html} className="display display-m block uppercase" />,
              image: liveImage(`sport-casual-${String(s.image).padStart(2, "0")}`),
            }))}
          />
        </div>
      </section>

      {/* Réalisations */}
      <section className="scene-day py-24 md:py-36">
        <div className="wrap">
          <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SplitReveal
              as="h2"
              text={c.realisations}
              className="display display-l max-w-[16ch] text-navy"
            />
            <ThreadLink to={c.partnersLink.to}>{c.partnersLink.label}</ThreadLink>
          </div>
          <StitchLine className="mb-16 h-6 w-full" />
          <DiamondGallery
            groups={c.galleries.map((g) => ({
              key: g.key,
              label: g.title,
              heading: <h2 className="display display-m text-navy">{g.title}</h2>,
              images: liveRange("sport-casual", g.from, g.to),
            }))}
          />
          <SocialRow pageKey="sport-casual" className="mt-24" />
        </div>
      </section>
    </>
  );
}
