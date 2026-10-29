import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { avifSrcSet, webpSrcSet, type AnyImage } from "@/lib/images";

type Props = {
  image: AnyImage;
  /** Width / height. Omit when the parent already sizes the box (e.g. absolute fill). */
  ratio?: number | undefined;
  className?: string | undefined;
  imgClassName?: string | undefined;
  priority?: boolean | undefined;
  sizes?: string | undefined;
  style?: CSSProperties | undefined;
  /** Fill the parent (absolute inset-0) instead of creating an aspect-ratio box. */
  fill?: boolean | undefined;
  /** Shows the "Voir" cursor over this image. */
  cursor?: "view" | undefined;
  /** "contain" for logos and product cut-outs. */
  fit?: "cover" | "contain" | undefined;
};

/**
 * Image slot. Renders <picture> (AVIF + WebP srcset, width/height, lazy unless `priority`)
 * when the file exists in public/ (flag `ok`, set at build by scripts/sync-images.mjs),
 * otherwise a navy placeholder at the exact final aspect ratio, labelled with the slot id and
 * carrying the verbatim alt text for assistive tech.
 */
export function Img({
  image,
  ratio,
  className,
  imgClassName,
  priority,
  sizes,
  style,
  fill,
  cursor,
  fit = "cover",
}: Props) {
  const sz = sizes ?? (fill ? "100vw" : "(min-width: 1024px) 50vw, 100vw");
  const avif = avifSrcSet(image);
  const webp = webpSrcSet(image);
  const box: CSSProperties = fill
    ? { ...style }
    : { aspectRatio: ratio ? String(ratio) : undefined, ...style };
  return (
    <div
      className={cn("overflow-hidden", fill ? "absolute inset-0" : "relative", className)}
      style={box}
      data-cursor={cursor}
    >
      {image.ok ? (
        <picture>
          {avif && <source type="image/avif" srcSet={avif} sizes={sz} />}
          {webp && <source type="image/webp" srcSet={webp} sizes={sz} />}
          <img
            src={image.file}
            alt={image.alt}
            width={image.w}
            height={image.h}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            // React 19 forwards fetchPriority.
            fetchPriority={priority ? "high" : undefined}
            className={cn(
              "absolute inset-0 h-full w-full",
              fit === "contain" ? "object-contain" : "object-cover",
              imgClassName,
            )}
            style={image.pos ? { objectPosition: image.pos } : undefined}
            data-img
          />
        </picture>
      ) : (
        <div
          className={cn("img-ph", imgClassName)}
          role={image.alt ? "img" : undefined}
          aria-label={image.alt || undefined}
          aria-hidden={image.alt ? undefined : true}
          data-img
          data-slot={image.id}
        >
          <span aria-hidden="true">{image.id}</span>
        </div>
      )}
    </div>
  );
}
