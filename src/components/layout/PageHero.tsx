import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { breadcrumbsFor, routeInfo } from "@/lib/seo";
import { banner, heroImage, type AnyImage } from "@/lib/images";
import { Img } from "@/components/media/Img";
import { FabricShader, SplitReveal, StitchLine } from "@/components/fx";

export function Breadcrumbs({ pageKey, className }: { pageKey: string; className?: string }) {
  const trail = breadcrumbsFor(routeInfo(pageKey));
  if (!trail.length) return null;
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-cotton/70">
        {trail.map((c, i) => (
          <li key={i} className="flex items-center gap-3">
            {i > 0 && <span className="size-1 rotate-45 bg-gold" aria-hidden="true" />}
            {c.to && i < trail.length - 1 ? (
              <Link to={c.to} className="hover:text-gold">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === trail.length - 1 ? "page" : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

type HeroProps = {
  pageKey: string;
  /** H1 text (verbatim, from section 8 / the live page). */
  title: string;
  /** Full-bleed image under a navy gradient. Defaults to the page's hero (image-map.json);
   *  falls back to the FabricShader. */
  image?: AnyImage | undefined;
  /** The page's live banner, kept as a diamond swatch (real photo, verbatim alt). Defaults to
   *  banner(pageKey); null hides it when the banner is shown elsewhere on the page. */
  swatch?: AnyImage | null | undefined;
  /** Replace the background entirely (e.g. ink-spread gradient). */
  background?: ReactNode | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
  titleClassName?: string | undefined;
};

/** The client's live banner photo framed as a small gold-edged diamond. */
export function HeroSwatch({ image, className }: { image: AnyImage; className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-[calc(var(--header-h)+1.25rem)] right-[var(--gutter)] z-[2] size-20 sm:size-28 md:top-auto md:bottom-14 lg:size-44",
        className,
      )}
    >
      <div className="mask-diamond absolute inset-0">
        <Img image={image} fill sizes="(min-width: 1024px) 176px, 128px" />
      </div>
      <span className="absolute inset-[14.6%] rotate-45 border border-gold/80" aria-hidden="true" />
    </div>
  );
}

/** Inner-page night hero: background, breadcrumb, SplitReveal H1, gold stitch sewing down. */
export function PageHero({
  pageKey,
  title,
  image: imageProp,
  swatch: swatchProp,
  background,
  children,
  className,
  titleClassName,
}: HeroProps) {
  const image = imageProp ?? heroImage(pageKey);
  const swatch = swatchProp === undefined ? banner(pageKey) : swatchProp;
  return (
    <section
      className={cn(
        "scene-night grain relative flex min-h-[64vh] flex-col justify-end overflow-hidden md:min-h-[70vh]",
        className,
      )}
    >
      {background ??
        (image ? (
          <>
            <Img image={image} fill priority imgClassName="scale-105" />
            {/* Keep the subject readable: a light left wash for the title, a bottom fade. */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/40 to-navy/5"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40"
              aria-hidden="true"
            />
          </>
        ) : (
          <FabricShader />
        ))}
      <div className="wrap relative z-[2] pt-[calc(var(--header-h)+3rem)] pb-14 md:pb-20">
        <Breadcrumbs pageKey={pageKey} className="mb-8" />
        <SplitReveal
          as="h1"
          text={title}
          trigger="mount"
          className={cn("display display-l max-w-[14ch] text-balance", titleClassName)}
        />
        {children}
      </div>
      {swatch?.ok && <HeroSwatch image={swatch} />}
      <StitchLine
        variant="vertical"
        mode="once"
        className="absolute bottom-0 left-[var(--gutter)] z-[2] h-16 w-3 md:left-[calc(var(--gutter)+0.5rem)]"
      />
    </section>
  );
}
