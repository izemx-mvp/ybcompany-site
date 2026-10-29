import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageSocials } from "@/content/pages/socials";
import { ambienceImage, liveImage, liveRange, type AnyImage } from "@/lib/images";
import { Img } from "@/components/media/Img";

/** Small tracked label with a gold diamond bullet (decorative; text must already exist). */
export function Kicker({
  children,
  className,
  light,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-3",
        light ? "text-gold-soft" : "text-navy",
        className,
      )}
    >
      <span className="size-1.5 rotate-45 bg-gold" aria-hidden="true" />
      {children}
    </span>
  );
}

/** The live "Facebook / Linkedin / Instagram" link row of a page. */
export function SocialRow({
  pageKey,
  className,
  light,
}: {
  pageKey: string;
  className?: string;
  light?: boolean;
}) {
  const links = pageSocials[pageKey];
  if (!links) return null;
  return (
    <ul className={cn("flex flex-wrap gap-x-8 gap-y-3", className)}>
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "label inline-flex items-center gap-2 border-b pb-1 transition-colors",
              light
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
  );
}

/** Text link to an internal page in the atelier style (label verbatim). */
export function ThreadLink({
  to,
  children,
  light,
  className,
}: {
  to: string;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group label inline-flex items-center gap-4",
        light ? "text-cotton" : "text-navy",
        className,
      )}
    >
      <span className="relative h-px w-10 overflow-hidden bg-current/30">
        <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
      </span>
      {children}
      <ArrowUpRight
        className="size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
        aria-hidden="true"
      />
    </Link>
  );
}

export function rangeImages(page: string, [from, to]: [number, number]): AnyImage[] {
  return liveRange(page, from, to);
}

export function resolveImage(
  ref: { live?: string | undefined; ambience?: string | undefined } | string,
): AnyImage {
  if (typeof ref === "string") {
    try {
      return liveImage(ref);
    } catch {
      return ambienceImage(ref);
    }
  }
  return ref.live ? liveImage(ref.live) : ambienceImage(ref.ambience!);
}

/** Media for StickySteps: 4:5 inline on mobile, fills the sticky frame on desktop. */
export function StepMedia({ image, className }: { image: AnyImage; className?: string }) {
  return (
    <div className={cn("relative aspect-[4/5] w-full md:aspect-auto md:h-full", className)}>
      <Img image={image} fill />
    </div>
  );
}

/** A square real-work tile used inside horizontal tracks. */
export function WorkTile({
  image,
  index,
  className,
}: {
  image: AnyImage;
  index?: number;
  className?: string;
}) {
  return (
    <figure className={cn("group", className)}>
      <Img
        image={image}
        ratio={4 / 5}
        cursor="view"
        imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-atelier)] group-hover:scale-105"
      />
      {index !== undefined && (
        <figcaption className="label mt-3 flex items-center gap-3 opacity-70" aria-hidden="true">
          <span className="numeral text-base not-italic">{String(index + 1).padStart(2, "0")}</span>
        </figcaption>
      )}
    </figure>
  );
}
