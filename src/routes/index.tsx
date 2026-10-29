import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { banner, heroImage, liveRange } from "@/lib/images";
import { home } from "@/content/pages/about";
import { nav, site } from "@/content/site";
import { Img } from "@/components/media/Img";
import {
  ClipReveal,
  CountUp,
  FabricShader,
  Marquee,
  PinnedHorizontal,
  SplitReveal,
  StackCards,
  StickySteps,
  StitchLine,
} from "@/components/fx";
import { resolveImage, StepMedia, WorkTile } from "@/components/sections/blocks";
import { ContactScene } from "@/components/sections/ContactScene";

export const Route = createFileRoute("/")({
  head: () => pageHead("home"),
  component: Home,
});

function Home() {
  const hero = heroImage("home");
  const live = banner("home")!;
  const works = liveRange("home", 1, 18);

  return (
    <>
      {/* 1 — Immersive hero */}
      <section className="scene-night grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        {hero?.ok ? (
          <>
            <Img image={hero} fill priority imgClassName="scale-105" />
            {/* Light left wash for the title, bottom fade; the subject stays visible. */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/30 to-navy/0"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy via-navy/10 to-navy/50"
              aria-hidden="true"
            />
          </>
        ) : (
          <FabricShader />
        )}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 [perspective:1200px]"
          aria-hidden="true"
        >
          <div className="size-[62vmin] border border-gold/35 [transform:rotateZ(45deg)] motion-safe:animate-[spin-y_28s_linear_infinite] [transform-style:preserve-3d]">
            <div className="absolute inset-[9%] border border-gold/15" />
          </div>
        </div>
        <div className="wrap relative z-[2] grid-12 items-end gap-y-10 pt-[calc(var(--header-h)+4rem)] pb-16 md:pb-24">
          <div className="col-span-12 lg:col-span-9">
            <p className="label mb-8 text-gold-soft">{site.name}</p>
            <SplitReveal
              as="h1"
              text={home.h1}
              trigger="mount"
              className="display display-xl text-balance"
            />
          </div>
          {/* The client's live banner photo as a diamond swatch. */}
          <div className="col-span-5 col-start-8 mb-16 sm:col-span-4 sm:col-start-9 lg:col-span-2 lg:col-start-10 lg:mb-0">
            <ClipReveal
              shape="diamond"
              keepDiamond
              parallax={false}
              className="aspect-square w-full"
            >
              <Img image={live} fill sizes="(min-width: 1024px) 17vw, 42vw" />
            </ClipReveal>
          </div>
        </div>
        <a
          href="#manifeste"
          className="label absolute bottom-6 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-3 text-cotton/70 hover:text-gold"
          aria-label="Défiler"
        >
          <StitchLine variant="vertical" mode="once" className="h-14 w-3" />
          <ArrowDown className="size-4 motion-safe:animate-bounce" aria-hidden="true" />
        </a>
      </section>

      {/* 2 — Manifesto: the three commitments */}
      <section id="manifeste" className="scene-day py-24 md:py-32">
        <div className="wrap">
          <StickySteps
            steps={home.commitments.map((c) => ({
              key: c.title,
              content: (
                <>
                  <h3 className="display display-m mb-8 max-w-[16ch] text-navy">{c.title}</h3>
                  <div className="prose-atelier lede max-w-xl text-ink/80">
                    {c.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </>
              ),
              media: <StepMedia image={resolveImage(c.image)} />,
            }))}
          />
        </div>
      </section>

      <div className="scene-day">
        <StitchLine className="h-8 w-full" />
      </div>

      {/* 3 — Activities as stacked panels */}
      <StackCards
        panels={home.activities.map((a, i) => ({
          key: a.label,
          className: "scene-night",
          content: (
            <Link to={a.to} className="group absolute inset-0 block" data-cursor="view">
              <Img
                image={resolveImage(a.image)}
                fill
                imgClassName="transition-transform duration-[1600ms] ease-[var(--ease-atelier)] group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/10"
                aria-hidden="true"
              />
              <div className="wrap relative z-[2] flex h-full flex-col justify-end pb-[12vh]">
                <span className="numeral mb-4 text-3xl md:text-5xl" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display display-xl flex items-end justify-between gap-6 text-cotton">
                  {a.label}
                  <ArrowUpRight
                    className="mb-[0.15em] size-[0.5em] shrink-0 text-gold transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ),
        }))}
      />

      {/* 4 — Récentes réalisations */}
      <div className="scene-night grain">
        <PinnedHorizontal
          header={
            <SplitReveal
              as="h3"
              text={home.realisationsTitle}
              className="display display-l text-cotton"
            />
          }
          items={works.map((w, i) => (
            <WorkTile key={w.id} image={w} index={i} />
          ))}
        />
      </div>

      {/* 5 — Stats */}
      <section className="scene-deep grain relative overflow-hidden py-24 md:py-36">
        <div className="wrap relative z-[2] grid gap-16 md:grid-cols-3 md:gap-8">
          {site.stats.map((s) => (
            <div key={s.label} className="relative border-t border-cotton/15 pt-8">
              <span
                className="absolute -top-[5px] left-0 size-2.5 rotate-45 bg-gold"
                aria-hidden="true"
              />
              <CountUp
                value={s.value}
                className="display block text-[clamp(4.5rem,11vw,10rem)] leading-none text-gold"
              />
              <p className="label mt-4 text-cotton/80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 — Marquee of activity labels */}
      <section
        className="scene-night overflow-hidden border-y border-cotton/10 py-10 md:py-14"
        aria-label="Activités"
      >
        <Marquee
          speed={50}
          items={nav
            .filter((n) => n.children)
            .map((n) => (
              <Link
                key={n.label}
                to={n.children?.[0]?.to ?? n.to}
                className="display outline-text px-8 text-[clamp(3rem,8vw,7rem)] leading-none transition-colors duration-500 hover:text-gold-soft"
              >
                {n.label}
              </Link>
            ))}
          separator={<span className="mx-2 size-3 rotate-45 bg-gold" aria-hidden="true" />}
        />
      </section>

      {/* 7 — Contact */}
      <ContactScene />
    </>
  );
}
