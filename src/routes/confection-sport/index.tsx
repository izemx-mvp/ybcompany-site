import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { liveImage } from "@/lib/images";
import { confectionSport as c } from "@/content/pages/partenaires";
import { PageHero } from "@/components/layout/PageHero";
import { Rich } from "@/components/layout/Rich";
import { HoverList } from "@/components/sections/HoverList";
import { SocialRow } from "@/components/sections/blocks";

export const Route = createFileRoute("/confection-sport/")({
  head: () => pageHead("confection-sport"),
  component: ConfectionSport,
});

function ConfectionSport() {
  return (
    <>
      <PageHero pageKey="confection-sport" title={c.h1}>
        <p className="lede mt-10 max-w-2xl text-cotton/85">{c.intro}</p>
      </PageHero>

      <section className="scene-day py-24 md:py-32">
        <div className="wrap">
          <HoverList
            ratio={1}
            items={c.partners.map((p) => ({
              key: p.name,
              // The live H3 sometimes holds the description after <br><br>: first line big, rest small.
              title: (
                <Rich
                  html={p.title}
                  className="block text-base leading-relaxed text-ink/75 first-line:font-[family-name:var(--font-display)] first-line:text-[clamp(2.4rem,6vw,5.5rem)] first-line:leading-[1.05] first-line:text-navy"
                />
              ),
              body: p.text ? <p className="max-w-2xl text-ink/75">{p.text}</p> : undefined,
              image: liveImage(p.image),
            }))}
          />
          <SocialRow pageKey="confection-sport" className="mt-24" />
        </div>
      </section>
    </>
  );
}
