import { useEffect, useLayoutEffect, useState, type DependencyList } from "react";

export const isBrowser = typeof window !== "undefined";

export type GsapKit = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let kit: Promise<GsapKit> | null = null;

/** GSAP + ScrollTrigger, loaded once after hydration so they stay out of the critical path. */
export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    g.gsap.config({ nullTargetWarn: false });
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return kit;
}

/** Like useEffect, with GSAP passed in once loaded. The returned cleanup runs on unmount. */
export function useGsap(effect: (kit: GsapKit) => void | (() => void), deps: DependencyList): void {
  useEffect(() => {
    let alive = true;
    let cleanup: void | (() => void);
    loadGsap().then((k) => {
      if (alive) cleanup = effect(k);
    });
    return () => {
      alive = false;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export function prefersReducedMotion(): boolean {
  return isBrowser && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice(): boolean {
  return isBrowser && window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

/** False during SSR and the hydration render, true afterwards. */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function useReducedMotion(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return r;
}

export function useMediaQuery(query: string): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

export const EASE = "power3.out";
