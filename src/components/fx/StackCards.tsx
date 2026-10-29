import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useGsap } from "./core";

type Props = {
  panels: { key: string; content: ReactNode; className?: string }[];
  className?: string;
  /** Height of each panel. */
  panelClassName?: string;
};

/**
 * Full-width panels that stick and stack; the panel underneath scales down and dims as the
 * next one slides over it (transform/opacity only).
 */
export function StackCards({ panels, className, panelClassName }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap }) => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(el.querySelectorAll("[data-stack-inner]"));
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card, {
            scale: 0.9,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: next.parentElement,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });
        });
      });
      return () => mm.revert();
    },
    [panels.length],
  );

  return (
    <div ref={root} className={cn("relative", className)}>
      {panels.map((p, i) => (
        <div
          key={p.key}
          className={cn("sticky top-0 h-[100svh] overflow-hidden", panelClassName)}
          style={{ zIndex: i + 1 }}
        >
          <div
            data-stack-inner
            className={cn("relative h-full w-full origin-top will-change-transform", p.className)}
          >
            {p.content}
          </div>
        </div>
      ))}
    </div>
  );
}
