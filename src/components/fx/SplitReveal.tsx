import { createElement, useRef, useState, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion, useIsoLayoutEffect, useGsap } from "./core";

type Props = {
  as?: ElementType;
  /** Verbatim text. "\n" marks a line break (rendered as <br> before hydration). */
  text: string;
  className?: string;
  id?: string;
  /** Animate when scrolled into view (default) or immediately on mount (heroes). */
  trigger?: "view" | "mount";
  delay?: number;
  /** Extra content rendered after the text (e.g. an icon). */
  after?: ReactNode;
};

/**
 * Line/word mask reveal. The prerendered HTML holds the plain text; after hydration the
 * same words are wrapped in spans and animated (transform only). Nothing is added.
 */
export function SplitReveal({
  as = "h2",
  text,
  className,
  id,
  trigger = "view",
  delay = 0,
  after,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [split, setSplit] = useState(false);
  const lines = text.split("\n");

  useIsoLayoutEffect(() => {
    // Heroes hold the LCP element: they are never hidden and rise with CSS before hydration.
    if (trigger === "mount") return;
    if (prefersReducedMotion()) {
      ref.current?.setAttribute("data-split-ready", "");
      return;
    }
    setSplit(true);
  }, []);

  useGsap(
    ({ gsap }) => {
      const el = ref.current;
      if (!split || !el) return;
      const words = el.querySelectorAll<HTMLElement>(".split-word");
      const ctx = gsap.context(() => {
        gsap.set(words, { yPercent: 110, rotate: 2 });
        el.setAttribute("data-split-ready", "");
        gsap.to(words, {
          yPercent: 0,
          rotate: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.045,
          delay,
          ...(trigger === "view"
            ? { scrollTrigger: { trigger: el, start: "top 88%", once: true } }
            : {}),
        });
      }, el);
      return () => ctx.revert();
    },
    [split, delay, trigger],
  );

  const content = split
    ? lines.map((line, li) => (
        <span className="split-line" key={li}>
          {line.split(/(\s+)/).map((w, wi) =>
            /^\s+$/.test(w) ? (
              w
            ) : w ? (
              <span className="split-word" key={wi}>
                {w}
              </span>
            ) : null,
          )}
        </span>
      ))
    : lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line}
        </span>
      ));

  if (trigger === "mount") {
    const plain = lines.map((line, li) => (
      <span key={li} className="hero-rise" style={{ animationDelay: `${delay + li * 0.08}s` }}>
        {li > 0 && <br />}
        {line}
      </span>
    ));
    return createElement(as, { ref, id, className }, plain, after);
  }
  return createElement(as, { ref, id, className, "data-split": "" }, content, after);
}
