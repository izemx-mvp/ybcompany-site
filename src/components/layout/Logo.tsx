import { cn } from "@/lib/utils";
import { site } from "@/content/site";
import brand from "@/content/brand.json";

/**
 * Brand logo, from the client's files in src/assets (made transparent and resized by
 * scripts/process-logos.mjs). Color version on light backgrounds, white version on navy.
 */
export function Logo({
  variant = "white",
  className,
}: {
  variant?: "white" | "color";
  className?: string;
}) {
  const { w, h } = brand[variant];
  return (
    <img
      src={site.logo[variant]}
      alt={site.name}
      width={w}
      height={h}
      className={cn("h-14 w-auto md:h-16", className)}
    />
  );
}
