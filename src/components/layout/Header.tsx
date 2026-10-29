import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Facebook, Instagram, Mail, Menu, Phone, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { nav, site, type NavItem } from "@/content/site";
import { routes } from "@/lib/seo";
import { ambienceImage, heroImage, type AnyImage } from "@/lib/images";
import { Img } from "@/components/media/Img";
import { Magnetic, lockScroll } from "@/components/fx";
import { Logo } from "./Logo";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function previewFor(path: string): AnyImage {
  const r = routes.find((x) => x.path === path);
  return (r && heroImage(r.key)) || ambienceImage("fabric-poster");
}

function isActive(item: NavItem, pathname: string) {
  if (item.children) return item.children.some((c) => pathname.startsWith(c.to));
  return !!item.to && pathname.startsWith(item.to);
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

/**
 * Set when the user navigates while an overlay is open: the overlay's scroll unlock must
 * then send the NEW page to the top instead of restoring the old page's scroll position.
 */
let scrollTopOnUnlock = false;

/** Keyframes used by the overlays (curtain reveal). Rendered once inside each overlay. */
const OVERLAY_CSS = `
@keyframes yb-curtain { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes yb-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
.yb-curtain { animation: yb-curtain .7s cubic-bezier(.7,0,.2,1) both; }
.yb-rise { animation: yb-rise .7s cubic-bezier(.2,.7,.2,1) both; }
@media (prefers-reduced-motion: reduce) { .yb-curtain, .yb-rise { animation: none; } }
`;

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

/** Full desktop nav from this width; below it the burger + fullscreen menu are used. */
const DESKTOP_MQ = "(min-width: 1440px)";

/**
 * Two states:
 *  - top of page: full-width transparent bar over the night hero, hairline gold rule;
 *  - scrolled: compact floating "atelier" bar (inset, glass, thin border) with a gold
 *    reading-progress thread. Hides on scroll down, shows on scroll up.
 * Desktop (>=1440px): centered nav with mega overlay. Below: burger + fullscreen menu.
 * Labels/links mirror the live site menu (from @/content/site).
 */
export function Header() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const progress = useRef<HTMLSpanElement>(null);
  const overlayOpen = mega !== null || mobile;
  const overlayOpenRef = useRef(overlayOpen);
  overlayOpenRef.current = overlayOpen;

  const closeMega = useCallback(() => setMega(null), []);
  const closeMobile = useCallback(() => setMobile(false), []);

  const closeAllForNavigation = useCallback(() => {
    if (overlayOpenRef.current) scrollTopOnUnlock = true;
    setMega(null);
    setMobile(false);
  }, []);

  // Close on ANY navigation, including a link to the page already displayed (logo on home).
  useEffect(() => router.subscribe("onBeforeNavigate", closeAllForNavigation), [
    router,
    closeAllForNavigation,
  ]);

  // Scroll state: rAF-throttled, frozen while an overlay locks the page.
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (overlayOpenRef.current) return;
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - lastY) > 8) {
        setHidden(y > lastY && y > 320);
        lastY = y;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) {
        progress.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  useEffect(() => {
    setMega(null);
    setMobile(false);
    setHidden(false);
  }, [pathname]);

  // The desktop overlay must not survive a resize to the burger layout (and vice versa).
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const on = () => (mq.matches ? setMobile(false) : setMega(null));
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Contact opens on a split night/day scene: a transparent header would vanish over the day half.
  const solid = (scrolled || pathname.startsWith("/contact/")) && !overlayOpen;
  const floating = scrolled && !overlayOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-[transform,padding] duration-500 ease-[var(--ease-atelier)]",
          hidden && !overlayOpen ? "-translate-y-[120%]" : "translate-y-0",
          floating ? "px-[var(--gutter)] pt-3" : "px-0 pt-0",
        )}
      >
        <div
          className={cn(
            "relative mx-auto transition-[max-width,background-color,color,border-color,box-shadow] duration-500 ease-[var(--ease-atelier)]",
            floating ? "max-w-[1680px]" : "max-w-[100vw]",
            solid
              ? "border border-ink/10 bg-cotton/85 text-ink shadow-[0_10px_40px_-20px_rgba(1,39,79,0.45)] backdrop-blur-md"
              : "border border-transparent text-cotton",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-4 transition-[height,padding] duration-500 ease-[var(--ease-atelier)] min-[1440px]:gap-6",
              floating ? "h-16 px-4 sm:px-6" : "wrap h-[var(--header-h)]",
            )}
          >
            {/* Logo */}
            <Link
              to="/"
              onClick={closeAllForNavigation}
              className={cn(
                "shrink-0 origin-left transition-[opacity,transform] duration-500 hover:opacity-80",
                floating ? "scale-[0.82]" : "scale-100",
              )}
              aria-label={`${site.name} — Accueil`}
            >
              <Logo variant={solid ? "color" : "white"} />
            </Link>

            {/* Desktop nav (centered) */}
            <nav
              aria-label="Menu principal"
              className="mx-auto hidden min-w-0 min-[1440px]:block"
            >
              <ul className="flex items-center">
                {nav.map((item, i) => {
                  const active = isActive(item, pathname);
                  const open = mega === i;
                  const base =
                    "label group relative flex items-center gap-1 px-2.5 py-2.5 !text-[11.5px] !tracking-[0.1em] whitespace-nowrap transition-colors min-[1600px]:px-3.5 min-[1600px]:!text-[12px] min-[1600px]:!tracking-[0.14em]";
                  const indicator = (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute left-1/2 -bottom-0.5 size-1.5 -translate-x-1/2 rotate-45 bg-gold transition-[opacity,transform] duration-300",
                        active || open
                          ? "scale-100 opacity-100"
                          : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-70",
                      )}
                    />
                  );
                  return (
                    <li key={item.label}>
                      {item.children ? (
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls="mega-overlay"
                          aria-haspopup="dialog"
                          onClick={() => setMega(open ? null : i)}
                          onMouseEnter={() => mega !== null && !open && setMega(i)}
                          className={cn(base, open || active ? "text-gold" : "hover:text-gold")}
                        >
                          {item.label}
                          <svg
                            viewBox="0 0 10 6"
                            aria-hidden="true"
                            className={cn(
                              "size-2 transition-transform duration-300",
                              open && "rotate-180",
                            )}
                          >
                            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" />
                          </svg>
                          {indicator}
                        </button>
                      ) : (
                        <Link
                          to={item.to}
                          aria-current={active ? "page" : undefined}
                          onClick={closeAllForNavigation}
                          className={cn(base, active ? "text-gold" : "hover:text-gold")}
                        >
                          {item.label}
                          {indicator}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Actions */}
            <div className="ml-auto flex shrink-0 items-center gap-3 min-[1440px]:ml-0">
              {/* Phone: diamond icon; number shown only on very wide screens */}
              <a
                href={site.phoneHref}
                aria-label={`Appeler le ${site.phone}`}
                className="group hidden items-center gap-3 md:flex"
              >
                <span className="relative grid size-10 place-items-center" aria-hidden="true">
                  <span className="absolute inset-1.5 rotate-45 border border-current/35 transition-colors duration-300 group-hover:border-gold group-hover:bg-gold" />
                  <Phone className="relative size-3.5 transition-colors group-hover:text-ink" />
                </span>
                <span className="label hidden !text-[12px] !tracking-[0.12em] whitespace-nowrap transition-colors group-hover:text-gold min-[1780px]:inline">
                  {site.phone}
                </span>
              </a>

              <Magnetic className="hidden sm:inline-block">
                <Link
                  to="/contact/"
                  onClick={closeAllForNavigation}
                  className="btn-gold !px-5 !py-3 !text-[12px] !tracking-[0.14em] whitespace-nowrap"
                >
                  Demander un devis
                </Link>
              </Magnetic>

              <button
                type="button"
                className="group relative grid size-11 place-items-center min-[1440px]:hidden"
                aria-expanded={mobile}
                aria-controls="mobile-menu"
                aria-label={mobile ? "Fermer le menu" : "Ouvrir le menu"}
                onClick={() => setMobile((m) => !m)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-1.5 border border-current/40 transition-[transform,border-color] duration-500 group-hover:border-gold",
                    mobile ? "rotate-45 border-gold" : "rotate-0",
                  )}
                />
                {mobile ? (
                  <X className="relative size-5 text-gold" />
                ) : (
                  <Menu className="relative size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Top-of-page hairline / scrolled progress thread */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-500",
              !floating && !overlayOpen
                ? "bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-100"
                : "opacity-0",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden transition-opacity duration-300",
              floating ? "opacity-100" : "opacity-0",
            )}
          >
            <span
              ref={progress}
              className="block h-full origin-left bg-gold will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
        </div>
      </header>

      {mega !== null && nav[mega] && (
        <MegaOverlay index={mega} onSelect={setMega} onClose={closeMega} />
      )}
      {mobile && <MobileMenu pathname={pathname} onClose={closeMobile} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shared overlay behaviour: scroll lock, focus trap, Escape           */
/* ------------------------------------------------------------------ */

function useOverlay(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Runs once per overlay mount: never re-lock on parent re-renders.
  useEffect(() => {
    const unlock = lockScroll();
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("a[href],button")?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>(
          "a[href]:not([tabindex='-1']),button:not([disabled])",
        );
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

    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      if (scrollTopOnUnlock) {
        scrollTopOnUnlock = false;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      } else {
        prev?.focus?.({ preventScroll: true });
      }
    };
  }, []);

  return ref;
}

function onOverlayLinkClick(onClose: () => void) {
  scrollTopOnUnlock = true;
  onClose();
}

/** Up/Down arrows move focus between the links of a list. */
function arrowNav(e: ReactKeyboardEvent<HTMLUListElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("a[href]"));
  const i = links.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const next = e.key === "ArrowDown" ? (i + 1) % links.length : (i - 1 + links.length) % links.length;
  links[next]?.focus();
}

/* ------------------------------------------------------------------ */
/* Desktop mega overlay                                                */
/* ------------------------------------------------------------------ */

function MegaOverlay({
  index,
  onSelect,
  onClose,
}: {
  index: number;
  onSelect: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useOverlay(onClose);
  const figure = useRef<HTMLElement>(null);
  const item = nav[index]!;
  const children = item.children ?? [];
  const [hover, setHover] = useState(0);

  useEffect(() => setHover(0), [index]);

  // Subtle parallax of the preview following the pointer (CSS vars, no re-render).
  const onMove = (e: ReactMouseEvent) => {
    const el = figure.current;
    if (!el) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    el.style.setProperty("--px", `${x * -10}px`);
    el.style.setProperty("--py", `${y * -10}px`);
  };

  const current = children[hover];

  return (
    <div
      ref={ref}
      id="mega-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      onMouseMove={onMove}
      className="scene-night grain yb-curtain fixed inset-0 z-[55]"
    >
      <style>{OVERLAY_CSS}</style>

      {/* Category watermark */}
      <span
        aria-hidden="true"
        key={`wm-${index}`}
        className="display outline-text yb-rise pointer-events-none absolute right-[-2vw] bottom-[-3vw] z-[1] text-[16vw] leading-none whitespace-nowrap opacity-[0.07]"
        style={{ animationDelay: "250ms" }}
      >
        {item.label}
      </span>

      {/* Scroller sits inside the grain layer so the grain never resizes the scrollbar. */}
      <div className="relative z-[2] flex h-full flex-col overflow-y-auto overscroll-contain [scrollbar-gutter:stable] pt-[var(--header-h)]">
        {/* Category tabs */}
        <div className="wrap border-b border-cotton/10">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 py-5">
            {nav.map((n, i) =>
              n.children ? (
                <li key={n.label}>
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-pressed={i === index}
                    className={cn(
                      "label flex items-center gap-2 transition-colors",
                      i === index ? "text-gold" : "text-cotton/55 hover:text-cotton",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 rotate-45 border border-gold transition-colors",
                        i === index ? "bg-gold" : "bg-transparent",
                      )}
                    />
                    {n.label}
                    <span className="font-mono text-[10px] text-cotton/35" aria-hidden="true">
                      {String(n.children.length).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        </div>

        <div className="wrap grid-12 flex-1 items-center gap-y-10 py-10">
          {/* Links */}
          <div className="col-span-12 lg:col-span-7" key={index}>
            <p className="label yb-rise mb-8 flex items-center gap-3 text-gold-soft">
              <span className="h-px w-10 bg-gold" aria-hidden="true" />
              {item.label}
            </p>
            <ul onKeyDown={arrowNav}>
              {children.map((c, i) => (
                <li
                  key={c.to}
                  className="yb-rise border-b border-cotton/10 first:border-t"
                  style={{ animationDelay: `${120 + i * 80}ms` }}
                >
                  <Link
                    to={c.to}
                    onClick={() => onOverlayLinkClick(onClose)}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    className="group relative grid grid-cols-[3rem_1fr_auto] items-center gap-4 overflow-hidden py-5"
                  >
                    {/* Gold sweep on hover */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-gold/10 to-transparent transition-transform duration-700 ease-[var(--ease-atelier)]",
                        hover === i ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                    <span
                      className={cn(
                        "relative font-mono text-xs tracking-widest transition-colors",
                        hover === i ? "text-gold" : "text-cotton/40",
                      )}
                      aria-hidden="true"
                    >
                      {pad(i)}
                    </span>
                    <span
                      className={cn(
                        "display display-m relative transition-[color,transform] duration-500 ease-[var(--ease-atelier)]",
                        hover === i ? "translate-x-3 text-gold-soft" : "text-cotton",
                      )}
                    >
                      {c.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative grid size-11 place-items-center transition-[opacity,transform] duration-500",
                        hover === i ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0",
                      )}
                    >
                      <span className="absolute inset-1.5 rotate-45 border border-gold" />
                      <ArrowUpRight className="relative size-4 text-gold" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Preview */}
          <div className="col-span-12 hidden lg:col-span-4 lg:col-start-9 lg:block">
            <figure
              ref={figure}
              className="yb-rise relative mx-auto aspect-[4/5] h-[min(56vh,500px)] max-w-full"
              style={{ animationDelay: "200ms" }}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out"
                style={{ transform: "translate3d(var(--px,0),var(--py,0),0)" }}
              >
                {children.map((c, i) => (
                  <div
                    key={c.to}
                    className="absolute inset-0 overflow-hidden transition-[clip-path,opacity] duration-700 ease-[var(--ease-atelier)]"
                    style={{
                      clipPath:
                        hover === i
                          ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                          : "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
                      opacity: hover === i ? 1 : 0,
                    }}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-atelier)]",
                        hover === i ? "scale-100" : "scale-110",
                      )}
                    >
                      <Img image={previewFor(c.to)} fill sizes="30vw" />
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
                    />
                  </div>
                ))}
              </div>
              <span className="absolute -inset-3 border border-gold/30" aria-hidden="true" />
              {(
                ["-top-4 -left-4", "-top-4 -right-4", "-bottom-4 -left-4", "-bottom-4 -right-4"] as const
              ).map((pos) => (
                <span
                  key={pos}
                  aria-hidden="true"
                  className={cn("absolute size-2 rotate-45 bg-gold", pos)}
                />
              ))}
              <figcaption className="absolute inset-x-0 -bottom-12 flex items-center justify-between gap-4 text-cotton/70">
                <span className="label truncate">{current?.label}</span>
                <span className="font-mono text-xs text-gold">
                  {pad(hover)} / {pad(children.length - 1)}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Contact strip */}
        <div className="wrap flex flex-wrap items-center justify-between gap-6 border-t border-cotton/10 py-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-cotton/75">
            <a href={site.phoneHref} className="label flex items-center gap-2 hover:text-gold">
              <Phone className="size-3.5" aria-hidden="true" /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="label flex items-center gap-2 hover:text-gold">
              <Mail className="size-3.5" aria-hidden="true" /> {site.email}
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/contact/"
              onClick={() => onOverlayLinkClick(onClose)}
              className="btn-gold !px-5 !py-3"
            >
              Demander un devis
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="label group flex items-center gap-3 text-cotton hover:text-gold"
            >
              Fermer
              <span className="relative grid size-9 place-items-center" aria-hidden="true">
                <span className="absolute inset-1 rotate-45 border border-current transition-transform duration-500 group-hover:rotate-[135deg]" />
                <X className="relative size-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile menu                                                         */
/* ------------------------------------------------------------------ */

function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const ref = useOverlay(onClose);
  const [open, setOpen] = useState<number | null>(() => {
    const i = nav.findIndex((n) => n.children && isActive(n, pathname));
    return i >= 0 ? i : null;
  });

  return (
    <div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="scene-night grain yb-curtain fixed inset-0 z-[55] min-[1440px]:hidden"
    >
      <style>{OVERLAY_CSS}</style>

      <div className="relative z-[2] flex h-full flex-col">
        <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] pt-[var(--header-h)]">
          <nav aria-label="Menu mobile" className="wrap pt-6 pb-10">
            <p className="label yb-rise mb-6 flex items-center gap-3 text-gold-soft">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              Menu
            </p>
            <ul className="divide-y divide-cotton/10 border-y border-cotton/10">
              {nav.map((item, i) => {
                const active = isActive(item, pathname);
                const title = (
                  <span className="flex items-baseline gap-3">
                    <span
                      className={cn(
                        "font-mono text-xs",
                        active ? "text-gold" : "text-gold/60",
                      )}
                      aria-hidden="true"
                    >
                      {pad(i)}
                    </span>
                    <span
                      className={cn(
                        "display text-[clamp(1.7rem,7vw,2.4rem)] leading-tight",
                        active && "text-gold-soft",
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                );
                return (
                  <li
                    key={item.label}
                    className="yb-rise"
                    style={{ animationDelay: `${150 + i * 60}ms` }}
                  >
                    {item.children ? (
                      <>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 py-4 text-left"
                          aria-expanded={open === i}
                          aria-controls={`mm-${i}`}
                          onClick={() => setOpen(open === i ? null : i)}
                        >
                          {title}
                          <span className="relative grid size-9 shrink-0 place-items-center" aria-hidden="true">
                            <span
                              className={cn(
                                "absolute inset-1 rotate-45 border border-gold/60 transition-colors duration-300",
                                open === i && "bg-gold",
                              )}
                            />
                            <Plus
                              className={cn(
                                "relative size-4 transition-[transform,color] duration-300",
                                open === i ? "rotate-45 text-ink" : "text-gold",
                              )}
                            />
                          </span>
                        </button>
                        <div
                          id={`mm-${i}`}
                          className={cn(
                            "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-atelier)]",
                            open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                          )}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <ul className="mb-5 ml-[0.6rem] border-l border-gold/30">
                              {item.children.map((c) => {
                                const here = pathname.startsWith(c.to);
                                return (
                                  <li key={c.to}>
                                    <Link
                                      to={c.to}
                                      onClick={() => onOverlayLinkClick(onClose)}
                                      aria-current={here ? "page" : undefined}
                                      tabIndex={open === i ? 0 : -1}
                                      className={cn(
                                        "relative flex items-center justify-between gap-3 py-3 pr-1 pl-6 transition-colors active:text-gold",
                                        here ? "text-gold" : "text-cotton/80",
                                      )}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={cn(
                                          "absolute -left-[5px] size-2.5 rotate-45 border border-gold",
                                          here ? "bg-gold" : "bg-transparent",
                                        )}
                                      />
                                      <span>{c.label}</span>
                                      <ArrowUpRight className="size-4 shrink-0 text-gold/70" aria-hidden="true" />
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={() => onOverlayLinkClick(onClose)}
                        aria-current={active ? "page" : undefined}
                        className="flex items-center justify-between gap-4 py-4"
                      >
                        {title}
                        <span className="relative grid size-9 shrink-0 place-items-center" aria-hidden="true">
                          <span className="absolute inset-1 rotate-45 border border-gold/60" />
                          <ArrowUpRight className="relative size-4 text-gold" />
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="yb-rise mt-10 space-y-3" style={{ animationDelay: "600ms" }}>
              <a href={`mailto:${site.email}`} className="label flex items-center gap-2 break-all text-cotton/75">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" /> {site.email}
              </a>
              <div className="flex gap-3 pt-3">
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
                    className="relative grid size-11 place-items-center"
                  >
                    <span aria-hidden="true" className="absolute inset-1.5 rotate-45 border border-cotton/25" />
                    <Icon className="relative size-4" />
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Sticky action bar */}
        <div className="yb-rise grid grid-cols-2 border-t border-cotton/10 pb-[env(safe-area-inset-bottom)]" style={{ animationDelay: "450ms" }}>
          <a
            href={site.phoneHref}
            className="label flex items-center justify-center gap-2 py-5 text-gold-soft active:bg-cotton/5"
          >
            <Phone className="size-4" aria-hidden="true" /> {site.phone}
          </a>
          <Link
            to="/contact/"
            onClick={() => onOverlayLinkClick(onClose)}
            className="label flex items-center justify-center gap-2 bg-gold py-5 text-ink"
          >
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  );
}