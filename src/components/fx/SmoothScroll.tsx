import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import type Lenis from "lenis";
import { isTouchDevice, prefersReducedMotion, useGsap } from "./core";

let lenis: Lenis | null = null;
let locks = 0;

export function getLenis() {
  return lenis;
}

/** Stops page scrolling (menus, lightbox, chat sheet). Returns the unlock function. */
export function lockScroll(): () => void {
  locks += 1;
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
  return () => {
    locks = Math.max(0, locks - 1);
    if (locks === 0) {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
  };
}

/**
 * Lenis smooth scrolling wired into GSAP's ticker and ScrollTrigger. Disabled for reduced
 * motion and touch devices (native momentum is better there). Resets scroll and refreshes
 * ScrollTrigger on every route change.
 */
export function SmoothScroll() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useGsap(({ gsap, ScrollTrigger }) => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    let raf: ((t: number) => void) | null = null;
    let disposed = false;
    import("lenis").then(({ default: LenisCtor }) => {
      if (disposed) return;
      lenis = new LenisCtor({ lerp: 0.11, wheelMultiplier: 0.95 });
      lenis.on("scroll", ScrollTrigger.update);
      raf = (t: number) => lenis?.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    });
    return () => {
      disposed = true;
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  useGsap(
    ({ ScrollTrigger }) => {
      if (window.location.hash) return;
      lenis?.scrollTo(0, { immediate: true, force: true });
      const t = setTimeout(() => ScrollTrigger.refresh(), 120);
      return () => clearTimeout(t);
    },
    [pathname],
  );

  return null;
}
