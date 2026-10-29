import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Garment tech-pack style spec sheet: hairline table, monospace values (verbatim). */
export function TechPack({
  title,
  specs,
  tone = "day",
  className,
  refCode,
}: {
  title?: ReactNode;
  specs: string[][];
  tone?: "day" | "night";
  className?: string;
  refCode?: string;
}) {
  const night = tone === "night";
  return (
    <div className={cn("relative border", night ? "border-cotton/20" : "border-ink/20", className)}>
      <div
        className={cn(
          "flex items-center justify-between border-b px-5 py-3",
          night ? "border-cotton/20" : "border-ink/20",
        )}
      >
        {title ? <div className="label">{title}</div> : <span />}
        {refCode && (
          <span
            className={cn(
              "font-mono text-[10px] tracking-widest",
              night ? "text-cotton/50" : "text-ink/50",
            )}
            aria-hidden="true"
          >
            {refCode}
          </span>
        )}
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {specs.map(([k, v]) => (
            <tr
              key={k}
              className={cn(
                "border-b last:border-b-0",
                night ? "border-cotton/12" : "border-ink/12",
              )}
            >
              <th
                scope="row"
                className={cn(
                  "w-[42%] px-5 py-3 text-left align-top font-medium",
                  night ? "text-cotton/70" : "text-ink/70",
                )}
              >
                {k} :
              </th>
              <td
                className={cn(
                  "px-5 py-3 font-mono text-[13px] tracking-tight",
                  night ? "text-cotton" : "text-navy",
                )}
              >
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="absolute -top-1 -left-1 size-2 rotate-45 bg-gold" aria-hidden="true" />
      <span className="absolute -right-1 -bottom-1 size-2 rotate-45 bg-gold" aria-hidden="true" />
    </div>
  );
}
