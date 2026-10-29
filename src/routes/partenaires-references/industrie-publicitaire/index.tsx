import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { liveRange } from "@/lib/images";
import { routeInfo } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Img } from "@/components/media/Img";
import { Marquee } from "@/components/fx";

export const Route = createFileRoute("/partenaires-references/industrie-publicitaire/")({
  head: () => pageHead("partenaires-pub"),
  component: PartenairesPub,
});

function PartenairesPub() {
  const logos = liveRange("partenaires-pub", 1, 20);
  const half = Math.ceil(logos.length / 2);
  const tile = (im: (typeof logos)[number]) => (
    <div className="mx-3 w-40 bg-white p-4 md:mx-5 md:w-56">
      <Img image={{ ...im, alt: "" }} ratio={1} sizes="160px" imgClassName="object-contain" />
    </div>
  );

  return (
    <>
      <PageHero
        pageKey="partenaires-pub"
        title={routeInfo("partenaires-pub").h1}
      />

      {/* Two counter-scrolling marquees (decorative duplicates) */}
      <section
        className="scene-night grain space-y-6 overflow-hidden py-20 md:py-28 motion-reduce:hidden"
        aria-hidden="true"
      >
        <Marquee speed={40} items={logos.slice(0, half).map((im) => tile(im))} />
        <Marquee speed={-40} items={logos.slice(half).map((im) => tile(im))} />
      </section>

      {/* Accessible static grid with the verbatim alts */}
      <section className="scene-day py-24 md:py-32">
        <div className="wrap">
          <ul className="grid grid-cols-2 border-t border-l border-ink/12 sm:grid-cols-3 lg:grid-cols-5">
            {logos.map((im) => (
              <li
                key={im.id}
                className="group relative border-r border-b border-ink/12 bg-white p-6 md:p-10"
              >
                <Img
                  image={im}
                  ratio={1}
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 42vw"
                  imgClassName="object-contain grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
