import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AnyImage } from "@/lib/images";
import { Img } from "@/components/media/Img";
import { isTouchDevice, prefersReducedMotion } from "@/components/fx/core";

export type HoverItem = {
  key: string;
  title: ReactNode;
  body?: ReactNode;
  image: AnyImage;
  aside?: ReactNode;
};

/**
 * Interactive list of large serif names. Desktop: hovering a row shows its image following
 * the cursor. Touch: tapping a row expands its image inline. All text and images are in the DOM.
 */
export function HoverList({
  items,
  tone = "day",
  ratio = 4 / 5,
  className,
  headingLevel = 3,
}: {
  items: HoverItem[];
  tone?: "day" | "night";
  ratio?: number;
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const follower = useRef<HTMLDivElement>(null);
  const night = tone === "night";

  useEffect(() => {
    if (isTouchDevice()) return;
    const el = follower.current;
    if (!el) return;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0,
      raf = 0;
    const reduce = prefersReducedMotion();
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      x += (tx - x) * (reduce ? 1 : 0.14);
      y += (ty - y) * (reduce ? 1 : 0.14);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={cn("relative", className)} onPointerLeave={() => setActive(null)}>
      <ul className={cn("border-t", night ? "border-cotton/15" : "border-ink/15")}>
        {items.map((it, i) => (
          <li
            key={it.key}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
            className={cn("group border-b", night ? "border-cotton/15" : "border-ink/15")}
          >
            <div className="relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 md:grid-cols-[5rem_1fr_auto] md:py-8">
              <span className="numeral text-xl md:text-3xl" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {createElement(
                `h${headingLevel}`,
                { className: "min-w-0" },
                <button
                  type="button"
                  className={cn(
                    "w-full text-left transition-[transform,color] duration-500 ease-[var(--ease-atelier)] after:absolute after:inset-0",
                    active === i && "translate-x-3",
                    active === i && (night ? "text-gold-soft" : "text-navy"),
                  )}
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {it.title}
                </button>,
              )}
              <span
                className={cn(
                  "size-3 rotate-45 border border-gold transition-colors",
                  active === i || open === i ? "bg-gold" : "",
                )}
                aria-hidden="true"
              />
            </div>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-atelier)] lg:hidden",
                open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pb-8">
                  <Img image={it.image} ratio={ratio} className="max-w-sm" />
                </div>
              </div>
            </div>
            {it.body && <div className="pb-8 pl-[3.5rem] md:pl-[6rem]">{it.body}</div>}
          </li>
        ))}
      </ul>
      <div
        ref={follower}
        className="pointer-events-none fixed top-0 left-0 z-30 hidden w-[22vw] max-w-[320px] lg:block"
        aria-hidden="true"
      >
        {items.map((it, i) => (
          <div
            key={it.key}
            className="absolute inset-x-0 top-0 transition-[clip-path,opacity] duration-500 ease-[var(--ease-atelier)]"
            style={{
              clipPath: active === i ? "inset(0)" : "inset(50% 50% 50% 50%)",
              opacity: active === i ? 1 : 0,
            }}
          >
            <Img image={{ ...it.image, alt: "" }} ratio={ratio} />
          </div>
        ))}
      </div>
    </div>
  );
}
