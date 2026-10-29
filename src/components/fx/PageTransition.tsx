import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { prefersReducedMotion } from "./core";

/** Navy curtain wipe with the diamond logo between routes (500ms). Skipped for reduced motion. */
export function PageTransition() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const timer = useRef<number>(0);

  useEffect(() => {
    return router.subscribe("onBeforeNavigate", (e) => {
      if (prefersReducedMotion()) return;
      if (!e.pathChanged) return;
      clearTimeout(timer.current);
      setPhase("in");
      timer.current = window.setTimeout(() => {
        setPhase("out");
        timer.current = window.setTimeout(() => setPhase("idle"), 260);
      }, 250);
    });
  }, [router]);

  if (phase === "idle") return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[85]" aria-hidden="true">
      <div
        className="absolute inset-0 flex items-center justify-center bg-navy"
        style={{
          transformOrigin: phase === "in" ? "bottom" : "top",
          animation: `${phase === "in" ? "curtain-in" : "curtain-out"} 250ms cubic-bezier(.7,0,.3,1) forwards`,
        }}
      >
        <img src="/favicon.png" alt="" width={56} height={56} className="size-14 opacity-90" />
      </div>
    </div>
  );
}
