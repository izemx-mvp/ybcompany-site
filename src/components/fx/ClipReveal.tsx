import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, useGsap } from "./core";

const RECT = "polygon(0% 0%, 50% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%, 0% 50%)";
const DIAMOND = "polygon(25% 25%, 50% 0%, 75% 25%, 100% 50%, 75% 75%, 50% 100%, 25% 75%, 0% 50%)";
const SMALL_DIAMOND =
  "polygon(37.5% 37.5%, 50% 25%, 62.5% 37.5%, 75% 50%, 62.5% 62.5%, 50% 75%, 37.5% 62.5%, 25% 50%)";
const INSET = "polygon(14% 14%, 50% 14%, 86% 14%, 86% 50%, 86% 86%, 50% 86%, 14% 86%, 14% 50%)";

type Props = {
  children: ReactNode;
  className?: string;
  shape?: "inset" | "diamond";
  /** Parallax: the inner media drifts while the block crosses the viewport. */
  parallax?: boolean;
  /** Keep the diamond mask at the end (diamond-shaped image). */
  keepDiamond?: boolean;
};

/** Reveals media via clip-path (inset or diamond → full) with a slight scale-down. */
export function ClipReveal({
  children,
  className,
  shape = "inset",
  parallax = true,
  keepDiamond,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap }) => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const ctx = gsap.context(() => {
        const from = keepDiamond ? SMALL_DIAMOND : shape === "diamond" ? DIAMOND : INSET;
        gsap.fromTo(
          el,
          { clipPath: from },
          {
            clipPath: keepDiamond ? DIAMOND : RECT,
            duration: 1.4,
            ease: "expo.inOut",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
        gsap.fromTo(
          inner.current,
          { scale: 1.25 },
          {
            scale: 1,
            duration: 1.8,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
        if (parallax) {
          gsap.fromTo(
            inner.current,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }
      }, el);
      return () => ctx.revert();
    },
    [shape, parallax, keepDiamond],
  );

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", keepDiamond && "mask-diamond", className)}
    >
      <div ref={inner} className="relative h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
