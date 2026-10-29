import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";
import { ambienceImage } from "@/lib/images";
import { valeurAjoutee } from "@/content/pages/about";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { Img } from "@/components/media/Img";
import { ClipReveal, StickySteps, StitchLine } from "@/components/fx";
import { StepMedia } from "@/components/sections/blocks";

export const Route = createFileRoute("/textile-habillement/notre-valeur-ajoutee/")({
  head: () => pageHead("valeur-ajoutee"),
  component: ValeurAjoutee,
});

function ValeurAjoutee() {
  const [first, ...rest] = valeurAjoutee.intro;
  const { activite, atouts } = valeurAjoutee;

  return (
    <>
      <PageHero pageKey="valeur-ajoutee" title={valeurAjoutee.h1} />

      {/* Intro as a serif pull-quote */}
      <section className="scene-day py-24 md:py-36">
        <div className="wrap grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span
              className="display mb-2 block text-[8rem] leading-[0.6] text-gold"
              aria-hidden="true"
            >
              “
            </span>
            <Rich as="p" html={first ?? ""} className="display display-m max-w-[22ch] text-navy" />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-2">
            <ClipReveal className="aspect-[16/10]">
              <Img image={ambienceImage("va-intro")} fill />
            </ClipReveal>
          </div>
          <div className="prose-atelier col-span-12 text-lg leading-[1.85] text-ink/80 md:col-span-6 lg:col-span-4 lg:col-start-8">
            {rest.map((p) => (
              <Rich key={p} as="p" html={p} />
            ))}
          </div>
        </div>
      </section>

      <div className="scene-day">
        <StitchLine className="h-8 w-full" />
      </div>

      {/* Notre activité — process */}
      <section id={activite.id} className="scene-day scroll-mt-24 pt-20 pb-10">
        <div className="wrap">
          <h3 className="display display-l mb-6 text-navy">
            <a href={`#${activite.id}`}>{activite.title}</a>
          </h3>
          <StickySteps
            steps={activite.items.map((it, i) => ({
              key: it,
              content: <p className="display display-s max-w-[24ch] text-ink">{it}</p>,
              media: <StepMedia image={ambienceImage(`va-step-${i + 1}`)} />,
            }))}
          />
        </div>
      </section>

      {/* Nos atouts — oversized numbered rows with hover image reveal */}
      <section id={atouts.id} className="scene-night grain scroll-mt-24 py-24 md:py-36">
        <div className="wrap relative z-[2]">
          <h3 className="display display-l mb-16 text-cotton">
            <a href={`#${atouts.id}`}>{atouts.title}</a>
          </h3>
          <AtoutRows items={atouts.items} />
        </div>
      </section>
    </>
  );
}

function AtoutRows({ items }: { items: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative">
      <ul className="border-t border-cotton/15">
        {items.map((it, i) => (
          <li
            key={it}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            className="group relative grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-b border-cotton/15 py-8 md:grid-cols-[9rem_1fr] md:py-12"
          >
            <span className="numeral text-4xl md:text-7xl" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "display display-m transition-[color,transform] duration-500 ease-[var(--ease-atelier)]",
                hover === i && "translate-x-3 text-gold-soft",
              )}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
      <div
        className="pointer-events-none absolute top-1/2 right-0 hidden w-[26vw] max-w-sm -translate-y-1/2 lg:block"
        aria-hidden="true"
      >
        {items.map((it, i) => (
          <div
            key={it}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 transition-[clip-path,opacity] duration-700 ease-[var(--ease-atelier)]"
            style={{
              clipPath: hover === i ? "inset(0)" : "inset(50% 0 50% 0)",
              opacity: hover === i ? 1 : 0,
            }}
          >
            <Img image={ambienceImage(`va-atout-${i + 1}`)} ratio={4 / 3} />
          </div>
        ))}
      </div>
    </div>
  );
}
