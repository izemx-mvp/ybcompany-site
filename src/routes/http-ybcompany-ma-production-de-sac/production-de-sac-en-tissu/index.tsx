import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

import { sacTissu as s } from "@/content/pages/sacs";
import { PageHero } from "@/components/layout/PageHero";
import { Img } from "@/components/media/Img";
import { ClipReveal, PinnedHorizontal, SplitReveal, StitchLine } from "@/components/fx";
import { rangeImages, SocialRow, WorkTile } from "@/components/sections/blocks";

export const Route = createFileRoute(
  "/http-ybcompany-ma-production-de-sac/production-de-sac-en-tissu/",
)({
  head: () => pageHead("sac-tissu"),
  component: SacTissu,
});

// Playful asymmetric collage: [col-span, row-span, offset classes]
const COLLAGE = [
  "col-span-6 md:col-span-5 md:row-span-2",
  "col-span-6 md:col-span-3 md:mt-24",
  "col-span-6 md:col-span-4",
  "col-span-6 md:col-span-3 md:col-start-7 md:-mt-10",
  "col-span-12 md:col-span-4 md:row-span-2",
  "col-span-6 md:col-span-4 md:col-start-2",
  "col-span-6 md:col-span-3 md:mt-16",
  "col-span-12 md:col-span-5 md:col-start-6 md:-mt-8",
];
const RATIOS = [4 / 5, 1, 4 / 3, 1, 3 / 4, 1, 4 / 5, 16 / 10];

function SacTissu() {
  const gouts = rangeImages("sac-tissu", s.gouts);
  return (
    <>
      <PageHero
        pageKey="sac-tissu"
        title={s.h1}
        titleClassName="max-w-[14ch]"
      />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12 gap-y-10">
          <SplitReveal
            as="h2"
            text={s.h2}
            className="display display-l col-span-12 text-navy lg:col-span-6"
          />
          <p className="lede col-span-12 text-ink/85 lg:col-span-5 lg:col-start-8 lg:self-end">
            {s.paragraph}
          </p>
        </div>
      </section>

      <section className="scene-day pb-24 md:pb-36">
        <div className="wrap">
          <StitchLine className="mb-16 h-6 w-full" />
          <SplitReveal
            as="h2"
            text={s.goutsTitle}
            className="display display-xl mb-16 italic text-navy md:text-center"
          />
          <ul className="grid grid-cols-12 gap-3 md:gap-6">
            {gouts.map((im, i) => (
              <li key={im.id} className={cn(COLLAGE[i])}>
                <ClipReveal shape={i % 3 === 1 ? "diamond" : "inset"}>
                  <Img image={im} ratio={RATIOS[i] ?? 1} cursor="view" />
                </ClipReveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="scene-night grain">
        <PinnedHorizontal
          header={
            <SplitReveal as="h2" text={s.realisations} className="display display-l text-cotton" />
          }
          items={rangeImages("sac-tissu", s.gallery).map((w, i) => (
            <WorkTile key={w.id} image={w} index={i} />
          ))}
        />
        <div className="wrap relative z-[2] pb-20">
          <SocialRow pageKey="sac-tissu" light />
        </div>
      </div>
    </>
  );
}
