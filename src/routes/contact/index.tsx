import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { site } from "@/content/site";
import { banner, heroImage } from "@/lib/images";
import { Img } from "@/components/media/Img";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { FabricShader, SplitReveal, StitchLine } from "@/components/fx";
import { ContactForm } from "@/components/sections/ContactForm";
import { MapEmbed } from "@/components/sections/ContactScene";

export const Route = createFileRoute("/contact/")({
  head: () => pageHead("contact"),
  component: Contact,
});

function Contact() {
  return (
    <>
      <section className="grid min-h-[100svh] lg:grid-cols-[5fr_7fr]">
        {/* Night: contact information */}
        <div className="scene-night grain relative overflow-hidden">
          {heroImage("contact")?.ok ? (
            <>
              <Img image={heroImage("contact")!} fill priority sizes="(min-width: 1024px) 42vw, 100vw" />
              <div
                className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/90 to-navy"
                aria-hidden="true"
              />
            </>
          ) : (
            <FabricShader />
          )}
          <div className="relative z-[2] flex h-full flex-col px-[var(--gutter)] pt-[calc(var(--header-h)+3rem)] pb-16 lg:pr-12">
            <Breadcrumbs pageKey="contact" className="mb-8" />
            <SplitReveal
              as="h1"
              text="Contactez-nous"
              trigger="mount"
              className="display display-l"
            />
            <StitchLine className="my-12 h-6 w-48" mode="once" />
            <address className="space-y-12 not-italic">
              {site.contacts.map((c) => (
                <div key={c.name}>
                  <p className="display display-s">
                    <strong className="font-medium">{c.name.toUpperCase()} </strong>
                  </p>
                  <p className="mt-3">
                    <strong className="font-normal">
                      Tél :{" "}
                      <a
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        className="font-mono tracking-tight hover:text-gold"
                      >
                        {c.phone}
                      </a>
                    </strong>
                  </p>
                  <p className="mt-1">
                    <strong className="font-normal">
                      <a
                        href={`mailto:${c.email}`}
                        className="underline decoration-gold underline-offset-4 hover:text-gold"
                      >
                        {c.email}
                      </a>
                    </strong>
                  </p>
                </div>
              ))}
              <div className="border-t border-cotton/15 pt-8 text-cotton/75">
                <p>{site.address}</p>
                <p className="mt-2">
                  <a href={site.phoneHref} className="hover:text-gold">
                    {site.phone}
                  </a>
                </p>
              </div>
            </address>
            {banner("contact")?.ok && (
              <Img
                image={banner("contact")!}
                ratio={1349 / 300}
                className="mt-12 border border-gold/30"
                sizes="(min-width: 1024px) 36vw, 90vw"
              />
            )}
          </div>
        </div>

        {/* Day: form */}
        <div className="scene-day px-[var(--gutter)] py-20 lg:px-16 lg:pt-[calc(var(--header-h)+3rem)]">
          <div className="mx-auto max-w-2xl">
            <ContactForm />
          </div>
        </div>
      </section>

      <MapEmbed className="h-[60vh] min-h-[380px]" />
    </>
  );
}
