import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { ambienceImage, liveRange } from "@/lib/images";
import { mode } from "@/content/pages/textile";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { PinnedHorizontal, SplitReveal, StickySteps, StitchLine } from "@/components/fx";
import { Kicker, SocialRow, StepMedia, ThreadLink, WorkTile } from "@/components/sections/blocks";

export const Route = createFileRoute("/textile-habillement/habillement-mode/")({
  head: () => pageHead("mode"),
  component: Mode,
});

type Block = { p: string } | { ul: string[] };

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-atelier space-y-4 text-ink/85">
      {blocks.map((b, i) =>
        "p" in b ? (
          <Rich key={i} as="p" html={b.p} />
        ) : (
          <ul key={i} className="space-y-2 border-l border-gold/60 pl-5">
            {b.ul.map((li) => (
              <Rich key={li} as="li" html={li} className="[&_strong]:mr-2 [&_strong]:block" />
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

function Mode() {
  const works = liveRange("mode", 1, 10);
  return (
    <>
      <PageHero pageKey="mode" title={mode.h1} />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12 gap-y-10">
          <h3 className="col-span-12 lg:col-span-3">
            <Kicker>{mode.kicker}</Kicker>
          </h3>
          <Rich
            as="p"
            html={mode.intro}
            className="display display-s col-span-12 !leading-[1.25] text-ink lg:col-span-8 lg:col-start-5 [&_strong]:text-navy [&_strong]:italic"
          />
        </div>
      </section>

      {/* Atelier journey: one long step sequence with the thread running through */}
      <section className="scene-day pb-16">
        <div className="wrap">
          <StitchLine className="mb-4 h-6 w-full" />
          <StickySteps
            steps={mode.steps.map((s) => ({
              key: s.label,
              content: (
                <>
                  <p className="display display-m mb-8 text-navy">
                    <strong className="font-medium">{s.label}</strong>
                  </p>
                  <Blocks blocks={s.blocks === "ARTICLES" ? mode.articles : s.blocks} />
                </>
              ),
              media: <StepMedia image={ambienceImage(s.image)} />,
            }))}
          />
        </div>
      </section>

      <div className="scene-night grain">
        <PinnedHorizontal
          header={
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <SplitReveal
                as="h2"
                text={mode.realisations}
                className="display display-l text-cotton"
              />
              <ThreadLink to={mode.partnersLink.to} light>
                {mode.partnersLink.label}
              </ThreadLink>
            </div>
          }
          items={works.map((w, i) => (
            <WorkTile key={w.id} image={w} index={i} />
          ))}
        />
        <div className="wrap relative z-[2] pb-20">
          <SocialRow pageKey="mode" light />
        </div>
      </div>
    </>
  );
}
