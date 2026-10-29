import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";
import { ambienceImage } from "@/lib/images";
import { businessModel } from "@/content/pages/about";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { Img } from "@/components/media/Img";
import { ClipReveal } from "@/components/fx";

export const Route = createFileRoute("/nous-connaitre/business-model/")({
  head: () => pageHead("business-model"),
  component: BusinessModel,
});

function BusinessModel() {
  const chapters = businessModel.chapters;
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => el && io.observe(el));
    const onScroll = () => {
      const r = root.current?.getBoundingClientRect();
      if (!r) return;
      const p = (window.innerHeight * 0.5 - r.top) / r.height;
      setProgress(Math.max(0, Math.min(1, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [chapters]);

  return (
    <>
      <PageHero pageKey="business-model" title={businessModel.h1} />

      <section className="scene-day py-24 md:py-32">
        <div className="wrap grid-12 gap-y-8">
          <div className="col-span-12 space-y-8 md:col-span-9 md:col-start-2 lg:col-span-8 lg:col-start-3">
            {businessModel.intro.map((p, i) => (
              <p
                key={p}
                className={cn(i === 0 ? "display display-s text-navy" : "lede text-ink/80")}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <div ref={root} className="relative">
        {/* Sticky side nav with progress thread */}
        <nav aria-label="Business Model" className="pointer-events-none sticky top-0 z-20 h-0">
          <div className="wrap pointer-events-auto hidden pt-[calc(var(--header-h)+2rem)] lg:block">
            <div className="relative w-56 pl-6 mix-blend-difference text-cotton">
              <span
                className="absolute top-0 bottom-0 left-0 w-px bg-cotton/25"
                aria-hidden="true"
              />
              <span
                className="absolute top-0 left-0 w-px origin-top bg-gold"
                style={{ height: "100%", transform: `scaleY(${progress})` }}
                aria-hidden="true"
              />
              <ol className="space-y-4">
                {chapters.map((c, i) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      className={cn(
                        "label block transition-opacity",
                        active === i ? "opacity-100" : "opacity-50 hover:opacity-90",
                      )}
                    >
                      <span className="numeral mr-3 text-sm not-italic" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {c.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </nav>

        {chapters.map((c, i) => {
          const night = i % 2 === 0;
          return (
            <section
              key={c.id}
              id={c.id}
              className={cn(
                "relative flex min-h-[100svh] scroll-mt-0 items-center py-28",
                night ? "scene-night grain" : "scene-day",
              )}
            >
              <div className="wrap relative z-[2] grid-12 items-center gap-y-12">
                <div className={"col-span-12 lg:col-span-6 lg:col-start-4"}>
                  <span className="numeral mb-6 block text-6xl md:text-8xl" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className={cn("display display-l mb-10", night ? "text-cotton" : "text-navy")}
                  >
                    <a href={`#${c.id}`}>{c.title}</a>
                  </h3>
                  <Rich
                    as="p"
                    html={c.html}
                    className={cn("lede", night ? "text-cotton/85" : "text-ink/80")}
                  />
                  {c.list.length > 0 && (
                    <ul className="mt-12">
                      {c.list.map((li, j) => (
                        <li
                          key={li}
                          className={cn(
                            "grid grid-cols-[3rem_1fr] gap-4 border-t py-6",
                            night ? "border-cotton/15" : "border-ink/12",
                          )}
                        >
                          <span className="numeral text-2xl leading-none" aria-hidden="true">
                            {String(j + 1).padStart(2, "0")}
                          </span>
                          <span className={night ? "text-cotton/90" : "text-ink/85"}>{li}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="col-span-12 lg:col-span-3">
                  <ClipReveal className="aspect-[3/4]">
                    <Img image={ambienceImage(c.image)} fill />
                  </ClipReveal>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
