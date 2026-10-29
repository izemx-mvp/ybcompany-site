import { Link } from "@tanstack/react-router";
import { nav } from "@/content/site";
import { heroImage } from "@/lib/images";
import { Img } from "@/components/media/Img";
import { FabricShader } from "@/components/fx";

/** 404 (noindex): night scene with a "broken thread" seam and links to the main sections. */
export function NotFound() {
  return (
    <section className="scene-night grain relative flex min-h-[100svh] items-center overflow-hidden">
      <title>Page introuvable - YB Company</title>
      <meta name="robots" content="noindex, follow" />
      {heroImage("not-found")?.ok ? (
        <>
          <Img image={heroImage("not-found")!} fill priority />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/20" aria-hidden="true" />
        </>
      ) : (
        <FabricShader />
      )}
      <div className="wrap relative z-[2] py-32">
        <svg viewBox="0 0 600 80" className="mb-10 h-12 w-full max-w-xl" aria-hidden="true">
          <path
            d="M0 40 C 80 10, 160 70, 260 40"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeDasharray="7 6"
            pathLength={1}
          />
          <path
            d="M0 40 C 80 10, 160 70, 260 40"
            fill="none"
            stroke="var(--navy)"
            strokeWidth="4"
            pathLength={1}
            strokeDasharray="1 1"
            style={{ animation: "fil-casse 1.6s cubic-bezier(.7,0,.3,1) reverse both" }}
          />
          <path d="M268 36 l10 -14 M272 46 l14 6" stroke="var(--gold)" strokeWidth="1.5" />
          <path
            d="M340 40 C 420 70, 500 10, 600 40"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeDasharray="7 6"
            opacity=".55"
          />
        </svg>
        <h1 className="display display-xl">404</h1>
        <ul className="mt-14 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {nav.map((n) => {
            const to = n.children?.[0]?.to ?? n.to;
            return (
              <li key={n.label}>
                <Link
                  to={to}
                  className="group flex items-center gap-4 border-b border-cotton/15 py-3 hover:border-gold"
                >
                  <span
                    className="size-2 rotate-45 border border-gold transition-colors group-hover:bg-gold"
                    aria-hidden="true"
                  />
                  <span className="display text-2xl">{n.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              to="/"
              className="group flex items-center gap-4 border-b border-cotton/15 py-3 hover:border-gold"
            >
              <span
                className="size-2 rotate-45 border border-gold transition-colors group-hover:bg-gold"
                aria-hidden="true"
              />
              <span className="display text-2xl">Accueil</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
