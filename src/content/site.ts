// Single source of truth for company facts. Used by the header/footer, contact page,
// JSON-LD, the chatbot system prompt (supabase/functions/chat) and the search index.
// All strings are verbatim from https://ybcompany.ma.

export const SITE_URL = "https://ybcompany.ma";

export const site = {
  name: "YB Company",
  tagline: "Industrie Publicitaire / Sublimation/ Atelier de production textile / sacherie",
  address: "ZI Moulay Rachid Lotissement Khaldia Rue 5 Lot n°2 Rez de chausée Casablanca",
  phone: "0522715720",
  phoneHref: "tel:0522715720",
  email: "yb.company.maroc@gmail.com",
  contacts: [
    { name: "Hamza Benhaddou", phone: "06 23 34 55 58", email: "h.benhaddou@ybcompany.ma" },
    { name: "Youssef Benhaddou", phone: "06 61 09 74 41", email: "yb.company.maroc@gmail.com" },
  ],
  // TODO: replace with the real WhatsApp number (international format, digits only).
  whatsapp: "212XXXXXXXXX",
  socials: {
    facebook: "https://www.facebook.com/ybcompanymaroc/",
    instagram: "https://www.instagram.com/ybcompanymaroc/",
  },
  // Live counters on the home page (data-to-value).
  stats: [
    { value: 100, label: "COLLABORATEURS" },
    { value: 372, label: "PARTENAIRES" },
    { value: 1576, label: "PROJETS" },
  ],
  mapEmbed:
    "https://maps.google.com/maps?q=Maroc%2C%20zone%20industrielle%20moulay%20rachid%2C%20yb%20company&t=m&z=10&output=embed&iwloc=near",
  logo: {
    color: "/brand/yb-logo-color.png",
    white: "/brand/yb-logo-white.png",
    mark: "/favicon.png",
  },
} as const;

/** Activities (used by the chatbot prompt; labels are the live menu labels). */
export const activities = [
  "Textile Habillement",
  "Habillement textile sport casual",
  "Habillement Mode",
  "Sublimation Textiles de Maison",
  "Impression grand format",
  "Aménagements d’espaces",
  "Affiche publicitaire et structure",
  "Production de sac non tissé",
  "Production de sac en tissu",
  "Masque de protection",
  "Fabricant de combinaison et sur-blouse de protection",
] as const;

export type NavLink = { label: string; to: string };
export type NavItem = { label: string; to: string; children?: NavLink[]; preview?: string };

/** Main menu — same labels and targets as the live site header. */
export const nav: NavItem[] = [
  {
    label: "À PROPOS",
    to: "/nous-connaitre/",
    preview: "philosophie-banner",
    children: [
      { label: "Philosophie", to: "/nous-connaitre/philosophie/" },
      { label: "Business Model", to: "/nous-connaitre/business-model/" },
    ],
  },
  {
    label: "Textile Habillement",
    to: "/textile-habillement/",
    preview: "sport-casual-banner",
    children: [
      { label: "Notre valeur ajoutée", to: "/textile-habillement/notre-valeur-ajoutee/" },
      {
        label: "Habillement textile sport casual",
        to: "/textile-habillement/habillement-textile-sport-casual/",
      },
      { label: "Habillement Mode", to: "/textile-habillement/habillement-mode/" },
      { label: "Sublimation Textiles de Maison", to: "/textile-habillement/sublimation-textiles/" },
    ],
  },
  {
    label: "Affiche publicitaire",
    to: "/industrie-publicitaire-affiche-publicitaire/",
    preview: "structures-banner",
    children: [
      {
        label: "Impression grand format",
        to: "/industrie-publicitaire-affiche-publicitaire/impression-grand-format/",
      },
      {
        label: "Aménagements d’espaces",
        to: "/industrie-publicitaire-affiche-publicitaire/amenagements-despaces/",
      },
      {
        label: "Affiche publicitaire et structure",
        to: "/industrie-publicitaire-affiche-publicitaire/affiche-publicitaire-structure/",
      },
    ],
  },
  {
    label: "Covid-19",
    to: "/http-ybcompany-ma-production-de-sac/",
    preview: "masques-banner",
    children: [
      {
        label: "Masque de protection",
        to: "/covid-19-masque-de-protection-reutilisable-bavette-de-protection-a-usage-unique/",
      },
      {
        label: "Fabricant de combinaison et sur-blouse de protection",
        to: "/masque-de-protection-fabricant-de-combinaison-et-sur-blouse-de-protection/",
      },
    ],
  },
  {
    label: "SACHERIE",
    to: "/http-ybcompany-ma-production-de-sac/",
    preview: "sac-non-tisse-banner",
    children: [
      {
        label: "Production de sac non tissé",
        to: "/http-ybcompany-ma-production-de-sac/production-de-sac-non-tisse/",
      },
      {
        label: "Production de sac en tissu",
        to: "/http-ybcompany-ma-production-de-sac/production-de-sac-en-tissu/",
      },
    ],
  },
  {
    label: "Partenaires",
    to: "/partenaires-references/",
    preview: "partenaires-mode-banner",
    children: [
      { label: "Confection mode", to: "/partenaires-references/textile-habillement-mode-sport/" },
      { label: "CONFECTION SPORT", to: "/confection-sport/" },
      { label: "Industrie Publicitaire", to: "/partenaires-references/industrie-publicitaire/" },
    ],
  },
  { label: "Contact", to: "/contact/" },
];

/** Parent URLs that only exist as redirects on the live site. */
export const parentRedirects: Record<string, string> = {
  "/nous-connaitre/": "/nous-connaitre/philosophie/",
  "/textile-habillement/": "/textile-habillement/notre-valeur-ajoutee/",
  "/industrie-publicitaire-affiche-publicitaire/":
    "/industrie-publicitaire-affiche-publicitaire/impression-grand-format/",
  "/partenaires-references/": "/partenaires-references/textile-habillement-mode-sport/",
};

export const whatsappHref = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
