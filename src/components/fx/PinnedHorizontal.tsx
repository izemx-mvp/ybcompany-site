import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useGsap } from "./core";

type Props = {
  /** Slides; each rendered at a fixed width in the track. */
  items: ReactNode[];
  className?: string;
  /** Heading / intro rendered above the track (stays pinned with it). */
  header?: ReactNode;
  tone?: "day" | "night";
  slideClassName?: string;
};

/**
 * Vertical scroll drives a horizontal track (desktop, motion allowed). Elsewhere it falls
 * back to a native scroll-snap row. A gold progress thread and "01 / 18" counter follow.
 */
export function PinnedHorizontal({
  items,
  className,
  header,
  tone = "night",
  slideClassName,
}: Props) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const total = items.length;

  useGsap(
    ({ gsap }) => {
      const el = section.current;
      const tr = track.current;
      if (!el || !tr) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => Math.max(0, tr.scrollWidth - tr.clientWidth);
        gsap.to(tr.children, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              setIndex(Math.min(total - 1, Math.round(self.progress * (total - 1))));
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        tr.style.overflowX = "hidden";
        return () => {
          tr.style.overflowX = "";
        };
      });
      return () => mm.revert();
    },
    [total],
  );

  // Native-scroll fallback counter.
  useEffect(() => {
    const tr = track.current;
    if (!tr) return;
    const on = () => {
      if (tr.style.overflowX === "hidden") return;
      const p = tr.scrollLeft / Math.max(1, tr.scrollWidth - tr.clientWidth);
      setIndex(Math.min(total - 1, Math.round(p * (total - 1))));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    tr.addEventListener("scroll", on, { passive: true });
    return () => tr.removeEventListener("scroll", on);
  }, [total]);

  useGsap(({ ScrollTrigger }) => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, []);

  const night = tone === "night";

  return (
    <section
      ref={section}
      className={cn(
        "relative flex min-h-screen flex-col justify-center overflow-hidden py-16 md:py-0",
        className,
      )}
    >
      {header && <div className="wrap mb-10 md:mb-12">{header}</div>}
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] md:gap-8"
        tabIndex={0}
        role="region"
        aria-label={`Galerie, ${total} images`}
      >
        {items.map((it, i) => (
          <div
            key={i}
            className={cn(
              "w-[78vw] shrink-0 snap-center sm:w-[46vw] md:w-[34vw] lg:w-[28vw] will-change-transform",
              i % 3 === 1 && "md:translate-y-10",
              slideClassName,
            )}
          >
            {it}
          </div>
        ))}
        <div className="w-[var(--gutter)] shrink-0" aria-hidden="true" />
      </div>
      <div className="wrap mt-10 flex items-center gap-6" aria-hidden="true">
        <span className="label tabular-nums">
          <span className={night ? "text-gold" : "text-navy"}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="opacity-60"> / {String(total).padStart(2, "0")}</span>
        </span>
        <span className={cn("relative h-px flex-1", night ? "bg-cotton/20" : "bg-ink/15")}>
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
        </span>
      </div>
    </section>
  );
}
