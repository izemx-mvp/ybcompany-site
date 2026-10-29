import routesJson from "@/content/routes.json";
import { SITE_URL, site } from "@/content/site";
import { heroImage } from "@/lib/images";
import imageDirs from "@/content/image-dirs.json";

export type RouteInfo = {
  key: string;
  path: string;
  title: string;
  h1: string;
  description: string | null;
  ogType?: string;
  /** Live og:image source URL (downloaded to /images/og/<key>.jpg by the image script). */
  ogImage: string | null;
  ogDescription?: string;
  twitterDescription?: string;
  twitterImage?: string;
  label: string;
  parent?: string;
};

export const routes = routesJson as RouteInfo[];

export function routeInfo(key: string): RouteInfo {
  const r = routes.find((x) => x.key === key);
  if (!r) throw new Error(`Unknown route key ${key}`);
  return r;
}

const abs = (p: string) => `${SITE_URL}${p}`;

/**
 * Local og:image: live pages that had one get /images/og/<dir>.jpg (dir = the page key, or its
 * ad-blocker-safe name from image-dirs.json), others the shared /og-image.jpg.
 */
export function ogImageFor(r: RouteInfo): string {
  const dir = (imageDirs as Record<string, string>)[r.key] ?? r.key;
  return r.ogImage ? abs(`/images/og/${dir}.jpg`) : abs("/og-image.jpg");
}

type Head = {
  meta: Array<Record<string, string>>;
  links: Array<Record<string, string>>;
  scripts: Array<{ type: string; children: string }>;
};

/** Breadcrumb trail for inner pages: Accueil › (parent menu label) › page label. */
export function breadcrumbsFor(r: RouteInfo): { label: string; to?: string }[] {
  if (r.key === "home") return [];
  const trail: { label: string; to?: string }[] = [{ label: "Accueil", to: "/" }];
  if (r.parent) trail.push({ label: r.parent });
  trail.push({ label: r.label, to: r.path });
  return trail;
}

/** Title, meta description (only when the live page has one), canonical, OG/Twitter, JSON-LD,
 *  and a high-priority preload of the hero image (the AVIF its <picture> picks first). */
export function pageHead(key: string): Head {
  const r = routeInfo(key);
  const url = abs(r.path);
  const image = ogImageFor(r);
  const ogDesc = r.ogDescription ?? r.description;
  const twDesc = r.twitterDescription ?? r.description;

  const meta: Head["meta"] = [{ title: r.title }];
  if (r.description) meta.push({ name: "description", content: r.description });
  meta.push(
    { name: "robots", content: "max-image-preview:large" },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:type", content: r.ogType ?? "article" },
    { property: "og:title", content: r.title },
    ...(ogDesc ? [{ property: "og:description", content: ogDesc }] : []),
    { property: "og:url", content: url },
    { property: "og:site_name", content: site.name },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary" },
    ...(twDesc ? [{ name: "twitter:description", content: twDesc }] : []),
    { name: "twitter:title", content: r.title },
    { name: "twitter:image", content: image },
  );

  const scripts: Head["scripts"] = [];
  if (key === "home") {
    scripts.push({ type: "application/ld+json", children: JSON.stringify(organizationLd()) });
  } else {
    const crumbs = breadcrumbsFor(r).filter((c) => c.to);
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.label,
          item: abs(c.to!),
        })),
      }),
    });
  }

  const links: Head["links"] = [{ rel: "canonical", href: url }];
  const hero = heroImage(key);
  if (hero?.ok && hero.stem && hero.aw) {
    links.push({
      rel: "preload",
      as: "image",
      type: "image/avif",
      href: `${hero.stem}-${hero.aw}.avif`,
      fetchPriority: "high",
    });
  }
  return { meta, links, scripts };
}

function organizationLd() {
  const sameAs = Object.values(site.socials);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: site.name,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}${site.logo.color}`,
        email: site.email,
        telephone: site.phone,
        sameAs,
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: site.name,
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/og-image.jpg`,
        telephone: site.phone,
        email: site.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "ZI Moulay Rachid Lotissement Khaldia Rue 5 Lot n°2 Rez de chausée",
          addressLocality: "Casablanca",
          addressCountry: "MA",
        },
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        sameAs,
      },
    ],
  };
}
