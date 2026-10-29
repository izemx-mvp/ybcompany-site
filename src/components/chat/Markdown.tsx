import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/** Inline: **bold**, [text](url). Internal links ("/...") navigate client-side. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={`${keyBase}-b${i++}`}>{m[1]}</strong>);
    } else if (m[2] !== undefined && m[3] !== undefined) {
      const href = m[3];
      const label = m[2];
      out.push(
        href.startsWith("/") ? (
          <Link
            key={`${keyBase}-l${i++}`}
            to={href}
            className="underline decoration-gold underline-offset-2"
          >
            {label}
          </Link>
        ) : /^(https?:|mailto:|tel:)/.test(href) ? (
          <a
            key={`${keyBase}-l${i++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-gold underline-offset-2"
          >
            {label}
          </a>
        ) : (
          label
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Minimal, safe markdown for chat replies: paragraphs, bold, links, - / 1. lists. No HTML. */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) {
      const k = `p${blocks.length}`;
      blocks.push(
        <p key={k}>
          {para.map((l, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {inline(l, `${k}-${i}`)}
            </Fragment>
          ))}
        </p>,
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `l${blocks.length}`;
      const Tag = list.ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={k} className={list.ordered ? "list-decimal pl-5" : "list-none pl-0"}>
          {list.items.map((it, i) => (
            <li
              key={i}
              className={
                list!.ordered
                  ? ""
                  : "relative pl-4 before:absolute before:top-[0.6em] before:left-0 before:size-1.5 before:rotate-45 before:bg-gold"
              }
            >
              {inline(it, `${k}-${i}`)}
            </li>
          ))}
        </Tag>,
      );
      list = null;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ul ?? ol)![1] ?? "");
    } else if (!line.trim()) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.replace(/^#+\s*/, ""));
    }
  }
  flushPara();
  flushList();
  return <div className="space-y-2.5">{blocks}</div>;
}
