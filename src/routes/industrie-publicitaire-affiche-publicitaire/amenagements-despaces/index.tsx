import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

import { amenagements as a } from "@/content/pages/impression-signaletique";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { Img } from "@/components/media/Img";
import { StitchLine } from "@/components/fx";
import { resolveImage } from "@/components/sections/blocks";

export const Route = createFileRoute(
  "/industrie-publicitaire-affiche-publicitaire/amenagements-despaces/",
)({
  head: () => pageHead("amenagements"),
  component: Amenagements,
});

function Amenagements() {
  const [active, setActive] = useState(0);
  return (
    <>
      <PageHero pageKey="amenagements" title={a.h1} />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12">
          <Rich
            as="p"
            html={a.intro}
            className="display display-s col-span-12 !leading-[1.3] text-ink md:col-span-10 lg:col-span-8 lg:col-start-3"
          />
        </div>
      </section>

      {/* Showcase accordion: tall image strips expand on hover / tap */}
      <section className="scene-night grain pb-24 md:pb-32">
        <StitchLine className="relative z-[2] h-8 w-full" />
        <div className="wrap relative z-[2] pt-16">
          <ul className="flex flex-col gap-3 md:h-[78vh] md:flex-row">
            {a.spaces.map((s, i) => {
              const on = active === i;
              const img = resolveImage(s.live ? { live: s.live } : { ambience: s.ambience });
              return (
                <li
                  key={s.title}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  className={cn(
                    "relative overflow-hidden transition-[flex-grow,height] duration-[900ms] ease-[var(--ease-atelier)] md:h-full md:min-w-[5.5rem]",
                    on ? "h-[60vh] md:flex-[4]" : "h-24 md:h-full md:flex-[1]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-expanded={on}
                    className="absolute inset-0 z-[3] md:pointer-events-none"
                    aria-label={s.title}
                  />
                  <Img
                    image={img}
                    fill
                    imgClassName={cn(
                      "transition-transform duration-[1400ms] ease-[var(--ease-atelier)]",
                      on ? "scale-100" : "scale-110",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 transition-colors duration-700",
                      on ? "bg-gradient-to-t from-navy via-navy/30 to-transparent" : "bg-navy/70",
                    )}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-0 z-[2] p-5 md:p-8">
                    <span className="numeral mb-2 block text-2xl" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      className={cn(
                        "display text-cotton transition-[font-size,opacity] duration-700",
                        on
                          ? "display-m"
                          : "text-2xl md:origin-bottom-left md:-rotate-90 md:translate-x-8 md:whitespace-nowrap md:text-3xl",
                      )}
                    >
                      {s.title}
                    </h2>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
