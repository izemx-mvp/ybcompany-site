import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, useGsap } from "./core";

export type Step = {
  key: string;
  /** Step body (heading + text, verbatim). */
  content: ReactNode;
  /** Media shown in the sticky column while the step is active. */
  media: ReactNode;
};

type Props = {
  steps: Step[];
  className?: string;
  /** Show 01 / 02 numerals in gold. */
  numerals?: boolean;
  tone?: "day" | "night";
  /** Put the media column on the left. */
  mediaLeft?: boolean;
};

/**
 * Pinned step sequence: the text column scrolls naturally while the media column is sticky
 * (CSS sticky, no scroll-jacking); the active step crossfades/clip-transitions the media and
 * fills a gold progress thread. On small screens each step shows its media inline.
 */
export function StickySteps({ steps, className, numerals = true, tone = "day", mediaLeft }: Props) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLSpanElement>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset["index"]));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  useGsap(({ gsap }) => {
    if (!root.current || !thread.current) return;
    if (prefersReducedMotion()) {
      gsap.set(thread.current, { scaleY: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        thread.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom 60%", scrub: 0.4 },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  const night = tone === "night";

  return (
    <div ref={root} className={cn("relative grid-12", className)}>
      {/* Progress thread */}
      <div
        className={cn(
          "absolute top-0 bottom-0 hidden w-px md:block",
          mediaLeft ? "left-[calc(50%+0.5rem)]" : "left-0",
        )}
        aria-hidden="true"
      >
        <span className={cn("absolute inset-0", night ? "bg-cotton/15" : "bg-ink/10")} />
        <span ref={thread} className="absolute inset-0 origin-top bg-gold" />
      </div>

      <ol
        className={cn(
          "col-span-12 md:col-span-6",
          mediaLeft ? "md:order-2 md:pl-[8%]" : "md:pl-[8%]",
        )}
      >
        {steps.map((s, i) => (
          <li
            key={s.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className="relative flex min-h-[70vh] flex-col justify-center py-16 md:min-h-[90vh]"
          >
            <div
              className={cn(
                "transition-opacity duration-700 ease-[var(--ease-atelier)] motion-reduce:opacity-100",
                active === i ? "opacity-100" : "md:opacity-35",
              )}
            >
              {numerals && (
                <span className="numeral mb-6 block text-5xl md:text-7xl" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              {s.content}
            </div>
            {/* Inline media on mobile */}
            <div className="mt-8 md:hidden">{s.media}</div>
          </li>
        ))}
      </ol>

      <div className={cn("col-span-12 hidden md:col-span-6 md:block", mediaLeft && "md:order-1")}>
        <div className="sticky top-0 flex h-screen items-center py-[12vh]">
          <div className="relative h-full w-full">
            {steps.map((s, i) => (
              <div
                key={s.key}
                aria-hidden={active !== i}
                className="absolute inset-0 transition-[clip-path,opacity] duration-[1100ms] ease-[var(--ease-atelier)] motion-reduce:transition-none"
                style={{
                  clipPath:
                    active === i
                      ? "inset(0% 0% 0% 0%)"
                      : i > active
                        ? "inset(100% 0% 0% 0%)"
                        : "inset(0% 0% 100% 0%)",
                  opacity: active === i ? 1 : 0.6,
                }}
              >
                {s.media}
              </div>
            ))}
            <div className="label absolute -bottom-8 right-0 tabular-nums" aria-hidden="true">
              <span className={night ? "text-gold" : "text-navy"}>
                {String(active + 1).padStart(2, "0")}
              </span>
              <span className="opacity-50"> / {String(steps.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
