import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Img } from "@/components/media/Img";
import type { AnyImage } from "@/lib/images";
import { lockScroll } from "./SmoothScroll";

type Props = {
  images: AnyImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

/** Accessible lightbox: focus trap, Esc, arrow keys, swipe; the alt text is the caption. */
export function Lightbox({ images, index, onIndex, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const img = images[index];
  const count = images.length;
  const go = (d: number) => onIndex((index + d + count) % count);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const unlock = lockScroll();
    return () => {
      unlock();
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>("button");
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Swipe
  const start = useRef<number | null>(null);
  if (!img) return null;

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Galerie d'images"
      className="fixed inset-0 z-[90] flex flex-col bg-navy-deep/97 text-cotton backdrop-blur-sm"
      onPointerDown={(e) => (start.current = e.clientX)}
      onPointerUp={(e) => {
        if (start.current === null) return;
        const dx = e.clientX - start.current;
        start.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <span className="label tabular-nums" aria-live="polite">
          <span className="text-gold">{String(index + 1).padStart(2, "0")}</span>
          <span className="opacity-60"> / {String(count).padStart(2, "0")}</span>
        </span>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          className="grid size-11 place-items-center border border-cotton/25 hover:border-gold"
          aria-label="Fermer"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center gap-2 px-2 pb-4 md:gap-6 md:px-8">
        <button
          type="button"
          onClick={() => go(-1)}
          className="grid size-11 shrink-0 place-items-center border border-cotton/25 hover:border-gold"
          aria-label="Image précédente"
        >
          <ChevronLeft className="size-5" />
        </button>
        <figure className="flex h-full max-h-[78vh] w-full max-w-[min(78vh,100%)] flex-col">
          <Img
            key={img.id}
            image={img}
            ratio={1}
            className="w-full"
            imgClassName="object-contain"
          />
          {img.alt && (
            <figcaption className="mt-4 text-center text-sm text-cotton/80">{img.alt}</figcaption>
          )}
        </figure>
        <button
          type="button"
          onClick={() => go(1)}
          className="grid size-11 shrink-0 place-items-center border border-cotton/25 hover:border-gold"
          aria-label="Image suivante"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
