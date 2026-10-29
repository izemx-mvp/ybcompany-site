import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { liveRange } from "@/lib/images";
import { structures as s } from "@/content/pages/impression-signaletique";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { DiamondGallery, Marquee, StitchLine } from "@/components/fx";
import { SocialRow } from "@/components/sections/blocks";

export const Route = createFileRoute(
  "/industrie-publicitaire-affiche-publicitaire/affiche-publicitaire-structure/",
)({
  head: () => pageHead("structures"),
  component: Structures,
});

function Structures() {
  return (
    <>
      <PageHero
        pageKey="structures"
        title={s.h1}
        titleClassName="max-w-[18ch]"
      />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12">
          <p className="col-span-12 text-lg leading-[1.85] text-ink/85 md:col-span-10 md:col-start-2 lg:col-span-7 lg:col-start-3 first-letter:float-left first-letter:pr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-[5.2em] first-letter:leading-[0.8] first-letter:text-navy">
            {s.intro}
          </p>
        </div>
      </section>

      <section
        className="scene-night overflow-hidden border-y border-cotton/10 py-8"
        aria-hidden="true"
      >
        <Marquee
          speed={-45}
          items={s.marquee.map((w) => (
            <span
              key={w}
              className="display outline-text px-6 text-[clamp(2.5rem,6vw,5rem)] leading-none"
            >
              {w}
            </span>
          ))}
          separator={<span className="size-2.5 rotate-45 bg-gold" />}
        />
      </section>

      <section className="scene-day py-24 md:py-32">
        <div className="wrap">
          <StitchLine className="mb-16 h-6 w-full" />
          <DiamondGallery
            columns="4"
            groups={s.galleries.map((g) => ({
              key: g.key,
              label: g.label,
              heading: (
                <Rich as="p" html={g.caption} className="display display-s max-w-3xl text-navy" />
              ),
              images: liveRange("structures", g.from, g.to),
            }))}
          />
          <SocialRow pageKey="structures" className="mt-24" />
        </div>
      </section>
    </>
  );
}
