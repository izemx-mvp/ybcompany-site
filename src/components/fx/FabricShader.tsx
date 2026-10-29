import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ambienceImage } from "@/lib/images";
import { Img } from "@/components/media/Img";
import { prefersReducedMotion } from "./core";

function canUseWebGL(): boolean {
  try {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    if (nav.connection?.saveData) return false;
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return false;
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/**
 * Fullscreen fabric background. Prerender / reduced motion / no WebGL / save-data: a static
 * poster (CSS silk gradient + the generated "fabric" image). Otherwise the ogl shader
 * chunk is lazy-loaded after first paint and paused when off-screen.
 */
export function FabricShader({
  className,
  poster = true,
}: {
  className?: string;
  poster?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const posterImg = ambienceImage("fabric-poster");

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReducedMotion() || !canUseWebGL()) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const start = () =>
      import("./fabric-gl").then(({ mountFabric }) => {
        if (!cancelled) dispose = mountFabric(el);
      });
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 400);
    return () => {
      cancelled = true;
      if (!w.requestIdleCallback) clearTimeout(id);
      dispose?.();
    };
  }, []);

  return (
    <div
      ref={host}
      className={cn("absolute inset-0 overflow-hidden bg-navy", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 25% 30%, rgb(16 70 128 / 0.55), transparent 65%), radial-gradient(70% 60% at 80% 75%, rgb(205 161 36 / 0.12), transparent 70%), linear-gradient(160deg, #01274f 0%, #0a1a30 70%, #1a2a3f 100%)",
        }}
      />
      {poster && posterImg.ok && <Img image={posterImg} fill />}
    </div>
  );
}
