import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { liveImage } from "@/lib/images";
import { sacNonTisse as s } from "@/content/pages/sacs";
import { PageHero } from "@/components/layout/PageHero";
import { Img } from "@/components/media/Img";
import { ClipReveal, PinnedHorizontal, SplitReveal } from "@/components/fx";
import { rangeImages, SocialRow, WorkTile } from "@/components/sections/blocks";

export const Route = createFileRoute(
  "/http-ybcompany-ma-production-de-sac/production-de-sac-non-tisse/",
)({
  head: () => pageHead("sac-non-tisse"),
  component: SacNonTisse,
});

function SacNonTisse() {
  return (
    <>
      <PageHero
        pageKey="sac-non-tisse"
        title={s.h1}
        titleClassName="max-w-[16ch]"
      />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12 gap-y-14">
          <div className="col-span-12 md:col-span-5">
            <ClipReveal shape="diamond" keepDiamond className="aspect-square">
              <Img image={liveImage("sac-non-tisse-01")} fill />
            </ClipReveal>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 md:self-center">
            <SplitReveal as="h2" text={s.h2} className="display display-m mb-10 text-navy" />
            <div className="space-y-6 text-lg leading-[1.85] text-ink/85">
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bag types as scroll-snapped panels */}
      <section className="scene-night grain py-24 md:py-28">
        <div
          className="no-scrollbar relative z-[2] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] md:gap-8"
          tabIndex={0}
          role="region"
          aria-label={s.h2}
        >
          {s.types.map((t, i) => (
            <article
              key={t.title}
              className="w-[84vw] shrink-0 snap-center md:w-[44vw] lg:w-[36vw]"
            >
              <Img image={liveImage(t.image)} ratio={1} cursor="view" />
              <div className="mt-8 grid grid-cols-[3rem_1fr] gap-4">
                <span className="numeral text-3xl" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="display display-m mb-4 capitalize">{t.title}</h3>
                  <p className="text-cotton/80">{t.text}</p>
                </div>
              </div>
            </article>
          ))}
          <div className="w-px shrink-0" aria-hidden="true" />
        </div>
      </section>

      <div className="scene-deep grain">
        <PinnedHorizontal
          header={
            <SplitReveal as="h2" text={s.realisations} className="display display-l text-cotton" />
          }
          items={rangeImages("sac-non-tisse", s.gallery).map((w, i) => (
            <WorkTile key={w.id} image={w} index={i} />
          ))}
        />
        <div className="wrap relative z-[2] pb-20">
          <SocialRow pageKey="sac-non-tisse" light />
        </div>
      </div>
    </>
  );
}
