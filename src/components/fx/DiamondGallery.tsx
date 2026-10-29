import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Img } from "@/components/media/Img";
import type { AnyImage } from "@/lib/images";
import { Lightbox } from "./Lightbox";

export type GalleryGroup = {
  key: string;
  /** Filter label — an existing heading/caption, verbatim. */
  label: string;
  /** Original heading or caption element, kept in the DOM above its images. */
  heading?: ReactNode;
  images: AnyImage[];
};

type Props = {
  groups: GalleryGroup[];
  className?: string;
  /** Show filter tabs (when there is more than one group). */
  filters?: boolean;
  tone?: "day" | "night";
  columns?: "3" | "4";
};

const RATIOS = [1, 0.8, 1, 1.25, 0.8, 1];

/**
 * Masonry gallery with tabs-as-filters and an accessible lightbox. All groups and headings
 * are in the prerendered HTML; filtering only hides groups client-side.
 */
export function DiamondGallery({
  groups,
  className,
  filters = true,
  tone = "day",
  columns = "3",
}: Props) {
  const [filter, setFilter] = useState<string | null>(null);
  const [open, setOpen] = useState<{ group: string; index: number } | null>(null);
  const showTabs = filters && groups.length > 1;
  const night = tone === "night";
  const openImages = useMemo(
    () => groups.find((g) => g.key === open?.group)?.images ?? [],
    [groups, open],
  );

  return (
    <div className={className}>
      {showTabs && (
        <div className="no-scrollbar -mx-[var(--gutter)] mb-12 overflow-x-auto px-[var(--gutter)]">
          <div role="toolbar" aria-label="Filtrer la galerie" className="flex w-max gap-2">
            {[{ key: "__all", label: "Tous" }, ...groups].map((g) => {
              const on = (filter ?? "__all") === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(g.key === "__all" ? null : g.key)}
                  className={cn(
                    "label border px-4 py-3 transition-colors duration-300",
                    on
                      ? night
                        ? "border-gold bg-gold text-navy"
                        : "border-navy bg-navy text-cotton"
                      : night
                        ? "border-cotton/25 text-cotton hover:border-gold"
                        : "border-ink/20 text-ink hover:border-navy",
                  )}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-20">
        {groups.map((g) => (
          <section key={g.key} hidden={filter !== null && filter !== g.key} aria-label={g.label}>
            {g.heading && <div className="mb-8">{g.heading}</div>}
            <ul
              className={cn(
                "columns-2 gap-3 md:gap-5",
                columns === "4" ? "md:columns-3 lg:columns-4" : "md:columns-3",
              )}
            >
              {g.images.map((im, i) => (
                <li key={im.id} className="mb-3 break-inside-avoid md:mb-5">
                  <button
                    type="button"
                    onClick={() => setOpen({ group: g.key, index: i })}
                    className="group relative block w-full overflow-hidden text-left"
                    aria-label={im.alt ? `Agrandir : ${im.alt}` : "Agrandir l'image"}
                    data-cursor="view"
                  >
                    <Img
                      image={im}
                      ratio={RATIOS[i % RATIOS.length] ?? 1}
                      sizes={columns === "4" ? "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" : "(min-width: 768px) 33vw, 50vw"}
                      imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-atelier)] group-hover:scale-[1.06]"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 border border-gold/0 transition-colors duration-500 group-hover:border-gold/70"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 bottom-3 size-3 rotate-45 border border-gold bg-navy/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {open && openImages.length > 0 && (
        <Lightbox
          images={openImages}
          index={open.index}
          onIndex={(index) => setOpen({ ...open, index })}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
