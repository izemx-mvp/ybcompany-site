import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { ambienceImage } from "@/lib/images";
import { philosophie } from "@/content/pages/about";
import { PageHero } from "@/components/layout/PageHero";
import { Img } from "@/components/media/Img";
import { ClipReveal, StitchLine } from "@/components/fx";
import { useGsap } from "@/components/fx/core";

export const Route = createFileRoute("/nous-connaitre/philosophie/")({
  head: () => pageHead("philosophie"),
  component: Philosophie,
});

function Philosophie() {
  return (
    <>
      <PageHero pageKey="philosophie" title={philosophie.h1} swatch={null} />

      {/* Editorial intro, two columns with a drop cap */}
      <section className="scene-day py-24 md:py-36">
        <div className="wrap grid-12 gap-y-14">
          <div className="drop-cap col-span-12 text-lg leading-[1.85] text-ink/85 md:col-span-10 md:col-start-2 md:columns-2 md:gap-14 lg:col-span-8 lg:col-start-2">
            {philosophie.intro.map((p) => (
              <p key={p} className="mb-6 break-inside-avoid">
                {p}
              </p>
            ))}
          </div>
          <div className="col-span-8 col-start-3 md:col-span-4 md:col-start-5 lg:col-span-2 lg:col-start-11">
            <ClipReveal shape="diamond" keepDiamond className="aspect-square">
              <Img image={ambienceImage("philosophie-intro")} fill />
            </ClipReveal>
          </div>
        </div>
      </section>

      {/* Five pillars as a vertical gold-thread timeline */}
      <section className="scene-night grain relative overflow-hidden py-24 md:py-36">
        <div className="wrap relative z-[2] grid-12">
          <p className="display display-s col-span-12 mb-20 max-w-3xl text-balance text-cotton md:col-span-9">
            {philosophie.lead}
          </p>
          <Pillars />
        </div>
      </section>
    </>
  );
}

function Pillars() {
  const list = useRef<HTMLUListElement>(null);
  useGsap(({ gsap }) => {
    const el = list.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.querySelectorAll<HTMLElement>("[data-pillar]").forEach((li) => {
        gsap.fromTo(
          li.querySelectorAll("[data-reveal]"),
          { opacity: 0.12, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: li, start: "top 75%", end: "top 45%", scrub: 0.5 },
          },
        );
        gsap.fromTo(
          li.querySelector("[data-knot]"),
          { scale: 0.3, backgroundColor: "rgba(205,161,36,0)" },
          {
            scale: 1,
            backgroundColor: "rgba(205,161,36,1)",
            scrollTrigger: {
              trigger: li,
              start: "top 62%",
              toggleActions: "play none none reverse",
            },
            duration: 0.5,
          },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="relative col-span-12 md:col-span-10 md:col-start-2">
      <StitchLine
        variant="vertical"
        triggerRef={list}
        start="top 70%"
        end="bottom 60%"
        className="absolute top-0 bottom-0 left-[11px] h-full w-3 md:left-[calc(16.66%+5px)]"
      />
      <ul ref={list} className="space-y-20 md:space-y-28">
        {philosophie.pillars.map((p, i) => (
          <li
            key={p}
            data-pillar
            className="relative grid grid-cols-[28px_1fr] gap-6 md:grid-cols-[16.66%_28px_1fr] md:gap-8"
          >
            <span
              data-reveal
              className="numeral hidden text-right text-6xl leading-none md:block"
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              data-knot
              className="mt-3 block size-[14px] justify-self-center rotate-45 border border-gold"
              aria-hidden="true"
            />
            <span data-reveal className="display display-m block text-balance">
              {p}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
