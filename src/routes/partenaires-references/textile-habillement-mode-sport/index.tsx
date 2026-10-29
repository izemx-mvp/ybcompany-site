import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";
import { liveImage } from "@/lib/images";
import { partenairesMode as p } from "@/content/pages/partenaires";
import { PageHero } from "@/components/layout/PageHero";
import { H } from "@/components/layout/Rich";
import { Img } from "@/components/media/Img";
import { ClipReveal, StitchLine } from "@/components/fx";
import { rangeImages, SocialRow } from "@/components/sections/blocks";

export const Route = createFileRoute("/partenaires-references/textile-habillement-mode-sport/")({
  head: () => pageHead("partenaires-mode"),
  component: PartenairesMode,
});

function PartenairesMode() {
  return (
    <>
      <PageHero pageKey="partenaires-mode" title={p.h1}>
        <p className="lede mt-10 max-w-2xl text-cotton/85">{p.intro}</p>
      </PageHero>

      {p.stories.map((s, i) => {
        const night = i % 2 === 1;
        const flip = i % 2 === 1;
        const gallery = rangeImages("partenaires-mode", s.gallery);
        // Long headings (description inside the H3 on the live page) get a smaller size.
        const long = s.title.length > 80;
        return (
          <article
            key={s.key}
            className={cn(
              "relative overflow-hidden py-24 md:py-32",
              night ? "scene-night grain" : "scene-day",
            )}
          >
            <div className="wrap relative z-[2]">
              {/* Spread: full-bleed cover / text */}
              <div className="grid-12 items-center gap-y-12">
                <div
                  className={cn("col-span-12 lg:col-span-6", flip && "lg:order-2 lg:col-start-7")}
                >
                  <ClipReveal className="aspect-[4/5] md:aspect-[5/4]">
                    <Img image={liveImage(s.cover)} fill />
                  </ClipReveal>
                </div>
                <div
                  className={cn(
                    "col-span-12 lg:col-span-5",
                    flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8",
                  )}
                >
                  <span className="numeral mb-6 block text-6xl" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <H
                    level={3}
                    html={s.title}
                    className={cn(
                      "display mb-8",
                      long
                        ? "text-xl leading-snug md:text-2xl [&>br]:mb-4 first-line:text-[2.6rem] first-line:leading-none md:first-line:text-[3.6rem]"
                        : "display-m",
                      !night && "text-navy",
                    )}
                  />
                  {s.extraHeadings?.map((h) => (
                    <h3
                      key={h}
                      className={cn(
                        "mb-8 text-lg leading-relaxed",
                        night ? "text-cotton/85" : "text-ink/80",
                      )}
                    >
                      {h}
                    </h3>
                  ))}
                  <div
                    className={cn(
                      "space-y-4 text-lg leading-relaxed",
                      night ? "text-cotton/85" : "text-ink/80",
                    )}
                  >
                    {s.paragraphs.map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                  </div>
                  <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                    {s.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "label inline-flex items-center gap-2 border-b pb-1",
                            night
                              ? "border-cotton/30 hover:border-gold hover:text-gold"
                              : "border-ink/25 hover:border-navy",
                          )}
                        >
                          {l.label}
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Collaboration carousel */}
              <div className="mt-20">
                {s.collaboration ? (
                  <h2 className="label mb-8 flex items-center gap-4">
                    <span className="size-1.5 rotate-45 bg-gold" aria-hidden="true" />
                    COLLABORATION
                  </h2>
                ) : (
                  <StitchLine className="mb-8 h-6 w-full" />
                )}
                <div
                  className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:gap-5"
                  tabIndex={0}
                  role="region"
                  aria-label={`${s.key} — ${gallery.length} images`}
                >
                  {gallery.map((im) => (
                    <div
                      key={im.id}
                      className="w-[62vw] shrink-0 snap-start sm:w-[36vw] md:w-[24vw] lg:w-[19vw]"
                    >
                      <Img image={im} ratio={1} cursor="view" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        );
      })}

      <section className="scene-day py-16">
        <div className="wrap">
          <SocialRow pageKey="partenaires-mode" />
        </div>
      </section>
    </>
  );
}
