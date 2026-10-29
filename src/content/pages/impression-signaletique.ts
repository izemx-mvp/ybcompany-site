// Verbatim text from https://ybcompany.ma — do not edit wording.

export const grandFormat = {
  h1: "impression grand format",
  h2: "IMPRESSION PETIT FORMAT",
  paragraphs: [
    "Nous disposons de la dernière génération d’imprimantes numériques. Nous offrons des impression grand format, très fiables, avec un rendu qualitatif très élevé. Nous vous proposons une prestation complète en grand et petit format : <strong>impression sur </strong><em><strong>Bâche</strong>, impression sur vinyle, impression sur oneway, impression sur papier couché. </em>",
    "<strong><em>Nous offrons </em></strong><strong><em>une</em></strong><strong><em> multitude de produits diversifiés tels que : banderoles, </em></strong><strong>bannières, autocollants PVC, affiches publicitaires, drapeaux, posters, présentoirs</strong> et tout autre support pour votre communication. Choisissez un partenaire spécialisé et fiable, capable de gérer tout type de demande dans des délai record",
  ],
  h4: "Impression numérique",
  // Live gallery images 01–16 are grouped by support in this order.
  supports: [
    {
      key: "bache",
      html: "impression<br>sur bâche",
      items: [
        "Affiches publicitaire",
        "Banderole publicitaire",
        "Panneau publicitaire",
        "Banner",
        "Roll up et Kakimono",
        "Décoration de stand",
      ],
      images: [1, 5] as [number, number],
    },
    {
      key: "vinyle",
      html: "impression<br>sur vinyle",
      items: [
        "Décoration d’intérieur",
        "Habillage de vitrine",
        "Palissade de chantier",
        "Habillage de véhicule",
        "Stickers voitures",
        "Vitrophanie",
        "Film adhésif",
      ],
      images: [6, 10] as [number, number],
    },
    {
      key: "papier",
      html: "impression<br>sur papier",
      items: ["Carte visite", "Brochure", "Prospectus", "Affiches papier", "Affiches informations"],
      images: [11, 13] as [number, number],
    },
    {
      key: "oneway",
      html: "impression sur oneway",
      items: ["Vitrine", "Façade", "Véhicule"],
      images: [14, 16] as [number, number],
    },
  ],
};

export const amenagements = {
  h1: "Aménagements d’espaces",
  intro:
    "Les aménagements d’espaces à vocation publicitaire sont très variés et utilisent différentes techniques de réalisation de ces ouvrages, y compris la sublimation et impressions sur divers supports.<br>D’autres matières sont utilisées, comme le bois, l’aluminium, le plastique, l’alucobond, le carton…",
  spaces: [
    { title: "Stand d’exposition", live: "amenagements-01" },
    { title: "PLV Enseignes et Totems", live: "amenagements-02" },
    { title: "Aménagements d’intérieur", live: "amenagements-03" },
    { title: "Aménagements de façades", ambience: "am-facades" },
  ] as { title: string; live?: string; ambience?: string }[],
};

export const structures = {
  h1: "STRUCTURES ET SUPPORTS PUBLICITAIRES",
  intro:
    "YB company offre une gamme de produits variées destinées à renforcer de manière efficace la communication visuelle de votre entreprise.Nos produits publicitaires sont utilisés lors des foires commerciales, évènements sportif et culturels, expositions, salons et points de vente. Nous proposons des produits à usages intérieur ou extérieur tels que : Affiche publicitaire, plv, goodies, photo call, palissade, banner, beachflag, feather flags, kakemono, habillage de voitures, drapeau, oriflamme, support d’affichage,présentoirs, voile, panneau publicitaire, banderole publicitaire etc…",
  // Original captions (bold italic paragraphs) introducing each gallery.
  galleries: [
    {
      key: "drapeaux",
      caption:
        "<strong><em>Drapeau, beach flag, wind flag, voile publicitaire, oriflamme avec différentes tailles, formes et couleurs ( S, M, L, XL )</em></strong>",
      label: "Drapeau, beach flag, wind flag",
      from: 1,
      to: 19,
    },
    {
      key: "rollup",
      caption:
        "<strong><em>Roll up, x-banner, l-banner, photocall, plv, cadre clic clac , stop trottoir </em></strong>",
      label: "Roll up, x-banner, l-banner",
      from: 20,
      to: 35,
    },
    {
      key: "palissade",
      caption:
        "<strong><em>Palissade, enseigne publicitaire, totem publicitaire, panneau publicitaire </em></strong>",
      label: "Palissade, enseigne publicitaire",
      from: 36,
      to: 45,
    },
    {
      key: "stand",
      caption:
        "<em><strong>Stand, stand parapluie, aménagement d’espace, aménagement </strong></em><strong><em>d’extérieur, aménagement d’interieur </em></strong>",
      label: "Stand, stand parapluie",
      from: 46,
      to: 63,
    },
    {
      key: "habillage",
      caption: "<em><strong>Habillage de voiture</strong></em>",
      label: "Habillage de voiture",
      from: 64,
      to: 73,
    },
  ],
  // Existing words from the captions above, for the marquee.
  marquee: [
    "Drapeau",
    "beach flag",
    "wind flag",
    "oriflamme",
    "Roll up",
    "x-banner",
    "photocall",
    "plv",
    "Palissade",
    "totem publicitaire",
    "Stand",
    "Habillage de voiture",
  ],
};
