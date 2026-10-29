import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";
import { liveImage, ambienceImage } from "@/lib/images";
import { sacherie } from "@/content/pages/sacs";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { Img } from "@/components/media/Img";
import { SplitReveal, StitchLine } from "@/components/fx";
import { prefersReducedMotion } from "@/components/fx/core";

export const Route = createFileRoute("/http-ybcompany-ma-production-de-sac/")({
  head: () => pageHead("sacherie"),
  component: Sacherie,
});

function Sacherie() {
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const slides = sacherie.slides.map(ambienceImage);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <>
      {/* Full-screen crossfading hero */}
      <section className="scene-night grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        {slides.map((im, i) => (
          <div
            key={im.id}
            className="absolute inset-0 transition-[opacity,transform] duration-[1600ms] ease-[var(--ease-atelier)]"
            style={{
              opacity: slide === i ? 1 : 0,
              transform: slide === i ? "scale(1)" : "scale(1.06)",
            }}
            aria-hidden={slide !== i}
          >
            <Img image={im} fill priority={i === 0} />
          </div>
        ))}
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/20"
          aria-hidden="true"
        />
        <div className="wrap relative z-[2] pt-[calc(var(--header-h)+3rem)] pb-16 md:pb-24">
          <Breadcrumbs pageKey="sacherie" className="mb-8" />
          <SplitReveal
            as="h1"
            text={sacherie.h1}
            trigger="mount"
            className="display display-xl max-w-[12ch]"
          />
          <div className="mt-10 flex gap-2" aria-hidden="true">
            {slides.map((im, i) => (
              <span
                key={im.id}
                className={cn(
                  "h-px w-12 transition-colors duration-700",
                  slide === i ? "bg-gold" : "bg-cotton/30",
                )}
              />
            ))}
          </div>
        </div>
      </section>

      <StitchLine className="h-8 w-full bg-cotton" />

      {/* Two giant split links */}
      <section className="scene-day">
        <ul className="grid md:grid-cols-2">
          {sacherie.links.map((l, i) => (
            <li key={l.to} className="relative border-ink/10 md:border-l md:first:border-l-0">
              <Link
                to={l.to}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                className="group relative flex min-h-[70vh] flex-col justify-end overflow-hidden p-[var(--gutter)] md:min-h-[90vh]"
                data-cursor="view"
              >
                <div
                  className="absolute inset-0 transition-[clip-path] duration-[900ms] ease-[var(--ease-atelier)] max-md:![clip-path:inset(0)]"
                  style={{ clipPath: hover === i ? "inset(0)" : "inset(100% 0 0 0)" }}
                >
                  <Img image={liveImage(l.image)} fill />
                  <div className="absolute inset-0 bg-navy/55" aria-hidden="true" />
                </div>
                <span className="numeral relative mb-4 text-4xl" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "display display-l relative flex items-end justify-between gap-6 transition-colors duration-500 max-md:text-cotton",
                    hover === i ? "text-cotton" : "text-navy",
                  )}
                >
                  {l.label}
                  <ArrowUpRight
                    className="mb-2 size-10 shrink-0 text-gold transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
