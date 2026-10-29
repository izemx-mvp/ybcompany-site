import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "./core";

type Props = {
  items: ReactNode[];
  className?: string;
  itemClassName?: string;
  /** Pixels per second at rest; negative = scroll right. */
  speed?: number;
  separator?: ReactNode;
};

/**
 * Infinite marquee, reacting to scroll velocity, pausing on hover. The prerendered HTML holds
 * one static row; the aria-hidden duplicate needed for the loop is added after hydration.
 * Reduced motion keeps the static, wrapping row.
 */
export function Marquee({ items, className, itemClassName, speed = 60, separator }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!prefersReducedMotion()) setLive(true);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!live || !el) return;
    let x = 0;
    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let boost = 0;
    let paused = false;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(el);
    const enter = () => (paused = true);
    const leave = () => (paused = false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const y = window.scrollY;
      const v = (y - lastY) / Math.max(dt, 0.001);
      lastY = y;
      boost += (Math.min(Math.abs(v), 3000) / 3000 - boost) * 0.08;
      if (visible && !paused) {
        const half = el.scrollWidth / 2;
        x -= speed * (1 + boost * 6) * dt;
        if (speed > 0 && -x >= half) x += half;
        if (speed < 0 && x >= 0) x -= half;
        el.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    if (speed < 0) x = -el.scrollWidth / 2;
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [live, speed]);

  const row = (hidden: boolean) =>
    items.map((it, i) => (
      <span
        key={`${hidden ? "d" : "o"}${i}`}
        className={cn("flex shrink-0 items-center", itemClassName)}
        aria-hidden={hidden || undefined}
      >
        {it}
        {separator}
      </span>
    ));

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={track}
        className="flex w-max will-change-transform motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center"
      >
        {row(false)}
        {live && row(true)}
      </div>
    </div>
  );
}
