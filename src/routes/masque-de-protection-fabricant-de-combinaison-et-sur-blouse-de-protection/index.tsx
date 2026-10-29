import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { banner, heroImage } from "@/lib/images";
import { protection } from "@/content/pages/protection";
import { Breadcrumbs, HeroSwatch } from "@/components/layout/PageHero";
import { Img } from "@/components/media/Img";
import { SplitReveal, StackCards } from "@/components/fx";
import { resolveImage } from "@/components/sections/blocks";
import { TechPack } from "@/components/sections/TechPack";

export const Route = createFileRoute(
  "/masque-de-protection-fabricant-de-combinaison-et-sur-blouse-de-protection/",
)({
  head: () => pageHead("protection"),
  component: Protection,
});

function Protection() {
  const hero = heroImage("protection");
  const live = banner("protection");
  return (
    <>
      <div className="relative h-[var(--header-h)] bg-navy" aria-hidden="true" />
      <StackCards
        panelClassName="max-md:relative max-md:h-auto max-md:min-h-[100svh] max-md:overflow-visible"
        panels={protection.products.map((p, i) => {
          const night = i % 2 === 0;
          const Heading = i === 0 ? "h1" : "h2";
          return {
            key: p.title,
            className: night ? "scene-night grain" : "scene-day",
            content: (
              <div className="relative h-full">
                {i === 0 && hero && (
                  <>
                    <Img image={hero} fill priority />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/10"
                      aria-hidden="true"
                    />
                  </>
                )}
                {i === 0 && live?.ok && <HeroSwatch image={live} />}
                <div className="wrap relative z-[2] grid-12 h-full content-center items-center gap-y-6 py-10 md:py-16">
                  <div className="col-span-12 md:col-span-6 lg:col-span-6">
                    {i === 0 && <Breadcrumbs pageKey="protection" className="mb-6" />}
                    <span className="numeral mb-3 block text-4xl md:text-6xl" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {i === 0 ? (
                      <SplitReveal
                        as="h1"
                        text={p.title}
                        trigger="mount"
                        className="display display-l mb-6"
                      />
                    ) : (
                      <Heading className={`display display-l mb-6 ${night ? "" : "text-navy"}`}>
                        {p.title}
                      </Heading>
                    )}
                    <p
                      className={`mb-8 max-w-xl text-[15px] leading-relaxed md:text-base ${night ? "text-cotton/85" : "text-ink/80"}`}
                    >
                      {p.text}
                    </p>
                    <TechPack specs={p.specs} tone={night ? "night" : "day"} className="max-w-xl" />
                  </div>
                  <div className="col-span-12 hidden md:col-span-5 md:col-start-8 md:block">
                    <Img image={resolveImage(p.image)} ratio={1} className="max-h-[70vh]" />
                  </div>
                </div>
              </div>
            ),
          };
        })}
      />
    </>
  );
}
