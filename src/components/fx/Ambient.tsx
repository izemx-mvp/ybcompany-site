import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isTouchDevice, prefersReducedMotion } from "./core";

/** Thin gold thread at the top of the viewport showing page progress. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? window.scrollY / h : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]" aria-hidden="true">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-gold" />
    </div>
  );
}

/**
 * Desktop-only cursor: a small gold diamond trailing a thin thread. Grows over elements with
 * [data-cursor="view"] (images) and shows "Voir". Hidden on touch and reduced motion.
 */
export function CursorThread() {
  const [on, setOn] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    setOn(true);
  }, []);

  useEffect(() => {
    if (!on) return;
    const pts = Array.from({ length: 14 }, () => ({ x: -100, y: -100 }));
    const mouse = { x: -100, y: -100 };
    let view = false;
    let visible = false;
    let raf = 0;
    const move = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        pts.forEach((p) => Object.assign(p, mouse));
        dot.current?.style.setProperty("opacity", "1");
      }
      const t = (e.target as Element | null)?.closest?.("[data-cursor='view']");
      if (!!t !== view) {
        view = !!t;
        dot.current?.classList.toggle("is-view", view);
      }
    };
    const leave = () => {
      visible = false;
      dot.current?.style.setProperty("opacity", "0");
    };
    const tick = () => {
      const head = pts[0]!;
      head.x += (mouse.x - head.x) * 0.35;
      head.y += (mouse.y - head.y) * 0.35;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i]!;
        const q = pts[i - 1]!;
        p.x += (q.x - p.x) * 0.38;
        p.y += (q.y - p.y) * 0.38;
      }
      if (dot.current) dot.current.style.transform = `translate3d(${head.x}px, ${head.y}px, 0)`;
      path.current?.setAttribute(
        "points",
        pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[95]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <polyline ref={path} fill="none" stroke="#cda124" strokeWidth="1" strokeOpacity="0.7" />
      </svg>
      <div
        ref={dot}
        className="cursor-dot absolute top-0 left-0 opacity-0 transition-opacity duration-300"
      >
        <span className="cursor-diamond" />
        <span className="cursor-label label">Voir</span>
      </div>
    </div>
  );
}

/** CTA that leans toward the pointer. */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouchDevice() || prefersReducedMotion()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const leave = () => (el.style.transform = "");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span
      ref={ref}
      className={cn(
        "inline-block transition-transform duration-500 ease-[var(--ease-atelier)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Counts up to `value` when visible. The final value is in the prerendered HTML. */
export function CountUp({
  value,
  className,
  duration = 2000,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = String(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {value}
    </span>
  );
}
