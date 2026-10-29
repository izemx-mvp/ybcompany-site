import { createElement, type ElementType } from "react";

/**
 * Renders verbatim inline HTML extracted from the live site (strong/em/br/a only).
 * Content is static and authored in src/content — never user input.
 */
export function Rich({
  html,
  as = "span",
  className,
  id,
}: {
  html: string;
  as?: ElementType;
  className?: string | undefined;
  id?: string | undefined;
}) {
  return createElement(as, { className, id, dangerouslySetInnerHTML: { __html: html } });
}

/** Heading of a given level with verbatim inline HTML. */
export function H({
  level,
  html,
  className,
  id,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  html: string;
  className?: string | undefined;
  id?: string | undefined;
}) {
  return <Rich as={`h${level}`} html={html} className={className} id={id} />;
}
