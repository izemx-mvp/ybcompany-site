import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { nav, site } from "@/content/site";
import { Magnetic, StitchLine } from "@/components/fx";
import { Logo } from "./Logo";

const WORDMARK = "YB COMPANY";

/**
 * Giant outlined wordmark that fills with gold on scroll. The font size is computed so the
 * word always fits the container width exactly (no cut letters at any screen size).
 */
function Wordmark() {
  const box = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number | null>(null);

  // 1) Fit the word to the container width.
  useEffect(() => {
    let raf = 0;
    const fit = () => {
      const b = box.current;
      const p = probe.current;
      if (!b || !p) return;
      const w = p.getBoundingClientRect().width; // width at 100px
      if (w > 0) setSize(Math.floor(((b.clientWidth * 0.995) / w) * 100 * 10) / 10);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(schedule);
    if (box.current) ro.observe(box.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // 2) Fill with gold from the word's position on screen (no GSAP: survives route changes).
  useEffect(() => {
    const el = fill.current;
    const b = box.current;
    if (!el || !b) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.clipPath = "inset(0 0% 0 0)";
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = b.getBoundingClientRect();
      // 0 when the top of the word enters the screen, 1 when the whole word is visible.
      let p = (vh - r.top) / r.height;
      // Always full at the very bottom of the page.
      const atBottom =
        window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      if (atBottom) p = 1;
      p = Math.min(1, Math.max(0, p));
      el.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    const ro = new ResizeObserver(on);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      ro.disconnect();
    };
  }, []);

  const fontSize = size ? `${size}px` : "13.5vw";
  const common = "display block leading-[0.82] whitespace-nowrap";

  return (
    <div ref={box} className="relative mt-24 w-full select-none" aria-hidden="true">
      <span
        ref={probe}
        className={`${common} pointer-events-none invisible absolute top-0 left-0`}
        style={{ fontSize: "100px" }}
      >
        {WORDMARK}
      </span>
      <span className={`${common} outline-text`} style={{ fontSize }}>
        {WORDMARK}
      </span>
      <span
        ref={fill}
        className={`${common} absolute inset-0 text-gold/90 transition-[clip-path] duration-300 ease-out`}
        style={{ fontSize, clipPath: "inset(0 100% 0 0)" }}
      >
        {WORDMARK}
      </span>
    </div>
  );
}

const linkCls =
  "group/l inline-flex items-center gap-2 transition-colors duration-300 hover:text-cotton";

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className={linkCls}>
      <span
        aria-hidden="true"
        className="h-px w-0 bg-gold transition-[width] duration-300 group-hover/l:w-3"
      />
      {label}
    </Link>
  );
}

/**
 * Navy-deep closing scene: big typographic contact, sitemap columns mirroring the menu,
 * fitted gold wordmark and a bottom bar with back-to-top.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const groups = nav.filter((n) => n.children);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className="scene-deep grain relative overflow-hidden pt-24 pb-8">
      <div className="wrap relative z-[2]">
        {/* ---------- Big contact ---------- */}
        <div className="grid-12 items-end gap-y-10">
          <div className="col-span-12 lg:col-span-8">
            <p className="label mb-6 flex items-center gap-3 text-gold-soft">
              <span className="h-px w-10 bg-gold" aria-hidden="true" />
              Contact
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={site.phoneHref}
                  className="group display inline-flex items-center gap-4 text-[clamp(2.25rem,5.5vw,5rem)] leading-none text-cotton"
                >
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size,color] duration-500 group-hover:bg-[length:100%_1px] group-hover:text-gold-soft">
                    {site.phone}
                  </span>
                  <ArrowUpRight
                    className="size-[0.5em] text-gold transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="group display inline-flex max-w-full items-center text-[clamp(1.3rem,3vw,2.6rem)] leading-tight break-all text-cotton/85"
                >
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size,color] duration-500 group-hover:bg-[length:100%_1px] group-hover:text-gold-soft">
                    {site.email}
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:flex lg:justify-end">
            <Magnetic>
              <Link to="/contact/" className="btn-gold">
                Demander un devis
              </Link>
            </Magnetic>
          </div>
        </div>

        <StitchLine className="my-16 h-6 w-full lg:my-20" />

        {/* ---------- Brand + sitemap ---------- */}
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-4">
            <Link to="/" aria-label={`${site.name} — Accueil`} className="inline-block">
              <Logo variant="white" className="!h-34" />
            </Link>
            <p className="label mt-8 max-w-sm leading-relaxed text-gold-soft">{site.tagline}</p>

            <address className="mt-8 space-y-3 text-sm not-italic text-cotton/75">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{site.address}</span>
              </p>
              <p className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <a href={site.phoneHref} className="hover:text-gold">
                  {site.phone}
                </a>
              </p>
              <p className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <a href={`mailto:${site.email}`} className="break-all hover:text-gold">
                  {site.email}
                </a>
              </p>
            </address>

            <div className="mt-8 flex gap-3">
              {[
                { href: site.socials.facebook, label: "Facebook", Icon: Facebook },
                { href: site.socials.instagram, label: "Instagram", Icon: Instagram },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group relative grid size-11 place-items-center"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-1.5 rotate-45 border border-cotton/25 transition-colors duration-300 group-hover:border-gold group-hover:bg-gold"
                  />
                  <Icon className="relative size-4 transition-colors duration-300 group-hover:text-ink" />
                </a>
              ))}
            </div>
          </div>

          <nav
            aria-label="Plan du site"
            className="col-span-12 grid grid-cols-1 gap-x-8 gap-y-10 min-[420px]:grid-cols-2 md:grid-cols-3 lg:col-span-8"
          >
            {groups.map((n) => (
              <div key={n.label}>
                <p className="label mb-5 flex items-center gap-2 text-gold-soft">
                  <span className="size-1.5 rotate-45 bg-gold" aria-hidden="true" />
                  {n.label}
                </p>
                <ul className="space-y-2.5 text-sm text-cotton/70">
                  {n.children!.map((c) => (
                    <li key={c.to}>
                      <FooterLink to={c.to} label={c.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="label mb-5 flex items-center gap-2 text-gold-soft">
                <span className="size-1.5 rotate-45 bg-gold" aria-hidden="true" />
                Contact
              </p>
              <ul className="space-y-2.5 text-sm text-cotton/70">
                <li>
                  <FooterLink to="/contact/" label="Contact" />
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* ---------- Giant wordmark (fits width exactly) ---------- */}
        <Wordmark />

        {/* ---------- Bottom bar (right padding keeps clear of the floating chat/WhatsApp buttons) ---------- */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-cotton/10 pt-6 pb-20 text-xs text-cotton/60 sm:flex-row sm:items-center sm:pr-28 sm:pb-0">
          <p suppressHydrationWarning>Tous droits réservés © {year}</p>
          <p className="label hidden md:block">{site.name}</p>
          <button
            type="button"
            onClick={toTop}
            className="label group flex items-center gap-3 text-cotton/70 transition-colors hover:text-gold"
          >
            Haut de page
            <span className="relative grid size-9 place-items-center" aria-hidden="true">
              <span className="absolute inset-1 rotate-45 border border-current transition-colors group-hover:bg-gold" />
              <ArrowUp className="relative size-3.5 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:text-ink" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}