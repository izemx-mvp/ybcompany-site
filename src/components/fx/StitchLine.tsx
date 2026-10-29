import { useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, useGsap } from "./core";

type Variant = "horizontal" | "vertical" | "around" | "down";

type Props = {
  variant?: Variant;
  className?: string;
  /** Scrub with scroll (default) or draw once on enter. */
  mode?: "scrub" | "once";
  /** Scroll range override for scrub mode. */
  start?: string;
  end?: string;
  color?: string;
  /** Element that drives the scrub (defaults to the svg itself). */
  triggerRef?: React.RefObject<HTMLElement | null>;
};

// Paths in a 0..1000 x 0..100 (horizontal) or 0..100 x 0..1000 (vertical) box.
const PATHS: Record<Variant, { d: string; viewBox: string }> = {
  horizontal: {
    viewBox: "0 0 1000 40",
    d: "M0 20 C 120 4, 240 36, 360 20 S 600 4, 720 20 S 900 36, 1000 18",
  },
  vertical: { viewBox: "0 0 20 1000", d: "M10 0 L10 1000" },
  down: {
    viewBox: "0 0 120 600",
    d: "M60 0 C 60 120, 20 160, 20 260 S 100 380, 100 470 S 60 560, 60 600",
  },
  around: { viewBox: "0 0 1000 1000", d: "M8 8 H992 V992 H8 Z" },
};

/**
 * A gold seam that "sews itself": a dashed path revealed through a mask whose
 * solid stroke is drawn with stroke-dashoffset (scrubbed by scroll).
 */
export function StitchLine({
  variant = "horizontal",
  className,
  mode = "scrub",
  start,
  end,
  color = "var(--gold)",
  triggerRef,
}: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const draw = useRef<SVGPathElement>(null);
  const id = useId().replace(/:/g, "");
  const { d, viewBox } = PATHS[variant];
  const vertical = variant === "vertical" || variant === "down";

  useGsap(
    ({ gsap }) => {
      const p = draw.current;
      if (!p || prefersReducedMotion()) return;
      const ctx = gsap.context(() => {
        const trigger = triggerRef?.current ?? svg.current;
        gsap.fromTo(
          p,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            ...(mode === "once" ? { duration: 1.6 } : {}),
            scrollTrigger:
              mode === "scrub"
                ? {
                    trigger,
                    start: start ?? (vertical ? "top 80%" : "top 95%"),
                    end: end ?? (vertical ? "bottom 60%" : "top 35%"),
                    scrub: 0.6,
                  }
                : { trigger, start: "top 90%", once: true },
          },
        );
      });
      return () => ctx.revert();
    },
    [mode, start, end, vertical],
  );

  return (
    <svg
      ref={svg}
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={cn("pointer-events-none block overflow-visible", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse">
          <path
            ref={draw}
            d={d}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={vertical ? 40 : 30}
            strokeDasharray="1 1"
            strokeDashoffset={0}
          />
        </mask>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="7 6"
        vectorEffect="non-scaling-stroke"
        mask={`url(#m${id})`}
      />
    </svg>
  );
}

/** Hairline with a gold diamond in the centre. */
export function DiamondDivider({ className, light }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4", className)} aria-hidden="true">
      <span className={cn("h-px flex-1", light ? "bg-cotton/20" : "bg-ink/15")} />
      <span className="block size-2.5 rotate-45 border border-gold bg-gold/30" />
      <span className={cn("h-px flex-1", light ? "bg-cotton/20" : "bg-ink/15")} />
    </div>
  );
}
