import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "@/content/site";
import { Magnetic, StitchLine } from "@/components/fx";

/** Google map, dark-styled via CSS filters, mounted only when it nears the viewport. */
export function MapEmbed({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ background: "linear-gradient(160deg,#0a1a30,#1a2a3f)" }}
    >
      {show && (
        <iframe
          title={`${site.name} — ${site.address}`}
          src={site.mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0 [filter:invert(.92)_hue-rotate(180deg)_saturate(.55)_brightness(.9)_contrast(.95)]"
        />
      )}
    </div>
  );
}

/** Home closing scene: address, phone and email in big type next to the map. */
export function ContactScene() {
  return (
    <section className="scene-day relative overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="wrap flex flex-col justify-center py-24 lg:py-32 lg:pr-16">
          <StitchLine className="mb-14 h-6 w-40" />
          <address className="not-italic">
            <p className="display display-s max-w-[22ch] text-navy">{site.address}</p>
            <p className="mt-10">
              <a href={site.phoneHref} className="display display-l text-navy hover:text-navy-deep">
                {site.phone}
              </a>
            </p>
            <p className="mt-6">
              <a
                href={`mailto:${site.email}`}
                className="text-lg text-ink/80 underline decoration-gold underline-offset-[6px] hover:text-navy md:text-2xl"
              >
                {site.email}
              </a>
            </p>
          </address>
          <Magnetic className="mt-12 self-start">
            <Link to="/contact/" className="btn-line text-navy">
              Contact
            </Link>
          </Magnetic>
        </div>
        <MapEmbed className="min-h-[420px] lg:min-h-full" />
      </div>
    </section>
  );
}
