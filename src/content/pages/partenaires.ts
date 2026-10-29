// Verbatim text from https://ybcompany.ma — do not edit wording.

type Link = { label: string; href: string };

export type PartnerStory = {
  key: string;
  /** H3 verbatim (html, may include the description when the live page put it in the heading). */
  title: string;
  /** Extra headings (H3) verbatim, when the live page used a heading for the description. */
  extraHeadings?: string[];
  paragraphs: string[];
  links: Link[];
  cover: string;
  /** Live content image range for the collaboration carousel. */
  gallery: [number, number];
  /** The live page shows an H2 "COLLABORATION" above the carousel. */
  collaboration: boolean;
};

export const partenairesMode = {
  h1: "CONFECTION DE MODE",
  intro:
    "La polyvalence et l’expertise a permis à YB Company de collaborer avec plusieurs marques dans le domaine du textile et habillement, aussi variées que prestigieuses, nationales et internationales dans la MODE et SPORTSWEAR.",
  stories: [
    {
      key: "timeless",
      title: "Timeless Fine art Photography",
      paragraphs: [
        "Timeless photography est un studio qui propose des photos artistiques pour nouveau né, enfant et femme enceinte. Ce studio hors du commun met à votre disposition des tenues tendances pour réussir vos photos. Une expérience inédite à vivre en famille.",
      ],
      links: [
        { label: "Facebook", href: "https://www.facebook.com/TimelessFineArtPhotography" },
        { label: "Instagram", href: "https://www.instagram.com/timeless_fine_art_photography/" },
        { label: "visiter le site", href: "http://www.timelessphotography.ma" },
      ],
      cover: "partenaires-mode-01",
      gallery: [2, 5],
      collaboration: false,
    },
    {
      key: "cosywear",
      title: "COSYWEAR CONCEPT",
      paragraphs: [
        "Cosywear concept est une marque 100 %marocaine de homewear and more. La marque propose un large choix d’ensembles de kimonos et articles loungewear à la fois stylés et comfy. L’esprit de Cosywear est de miser sur des collections capsules pour permettre à ses clientes de se sentir uniques. L’essayer c’est l’adopter",
      ],
      links: [{ label: "Instagram", href: "https://www.instagram.com/cosywear_concept/" }],
      cover: "partenaires-mode-06",
      gallery: [7, 10],
      collaboration: false,
    },
    {
      key: "soiree-pyjama",
      title: "soirée pyjama",
      paragraphs: [
        "Soirée pyjama est une nouvelle marque 100% marocaine qui a tout pour surprendre. Elle offre dans sa boutique en ligne un large choix de modèles de pyjama pour hommes et femmes à des prix très compétitifs. Vous en avez pour tous les gouts.",
      ],
      links: [
        {
          label: "Facebook",
          href: "https://www.facebook.com/SoireePyjamaBrand/?__tn__=kC-R&eid=ARA0KzVwEatoLVlO7Jbtz1ZmedDgkJg-HmvADHzslaD-TVwKehV2ntL8keOGu-J6DD78et3sx_eu_cU-&hc_ref=ARRdbuAIBkAblYBhSqtdBxu4PAc6pvBEGphIxG2R1XI2Dt3Z0Ol39aqP1Hnw7pYNNwo&__xts__%5B0%5D=68.ARA_DoczhTEbI1LnX2Qrt2plyRLfapVNUtZoeHfuFlgUpG3j809R30vtaZI3EAfK8vstpC6mta82QlFITZg2xE32VS3IeBJC7F8QgJqIpLGmrl729UmBCvuEvij_h0IJYQnunYgrpxeuc151Iac1twhKq5S-7g3ZOTLLcnuikAlVUFqfP4m5eVAWsvwfbfX9mg1bHAdrs9arYM50yeTe192XYpEhbad_cba1QBBUcrPi9dPbf2tL5lhe4U-tWbLXcYROtwEBqawfG8F108iBat_cxogrtify5smxFXXq62y4_oD55g8xB01orm39QkyZseNgW8bNg75KOeAfVVnn1w5jN5BeQRsJZc5sfHtHsS7H7J651uqnIcA-oyB8Wx_0_Czb8UuzbV-jEfTMJvH99ntrxy_EjN2VojpwNUz00BlJRe6RbqirrVYa76MIbcs93NBYuspwpricr-pvLAozOTRqwUy8vojJnZbpiZhUA_1scc9JrIUy_Jb7R1bGOAsqSeI5Jdp5Ebc",
        },
        { label: "Instagram", href: "https://www.instagram.com/soireepyjamabrand/" },
        { label: "visiter le site", href: "https://www.soireepyjama.ma" },
      ],
      cover: "partenaires-mode-11",
      gallery: [12, 16],
      collaboration: false,
    },
    {
      key: "yassine-morabite",
      title:
        "yassine morabite<br>Qui ne connait pas Yassine et son style affirmé ? ce jeune créateur de mode Marocain baigné dans le dessin et l'art depuis son jeune âge. Connu pour ces portraits décalés, mélangeant la tradition marocaine et la modernité, ainsi que ces créations fashion qui sont vendues un peu partout dans le monde ( Dubai, Maroc, Las palmas...). Aujourdhui Yb company collabore avec Yassine Morabite la nouvelle icône du streetwear pour l'élaboration et la confection de ses collections capsules originales.",
      paragraphs: [],
      links: [
        { label: "Facebook", href: "https://www.facebook.com/yassine.morabite.official" },
        { label: "Instagram", href: "https://www.instagram.com/yassine.morabite/" },
      ],
      cover: "partenaires-mode-17",
      gallery: [18, 35],
      collaboration: true,
    },
    {
      key: "amine-bendriouich",
      title: "Amine bendriouch",
      extraHeadings: [
        "Amine fait partie de la scène créative marocaine, tirant vers le haut sa notoriété, ce jeune designer est loin d'être inconnu des podiums à travers le monde, grâce a ses collections avant-gardistes alliant une touche tribale et artisanale. Amine ne cesse de surprendre avec son originalité et sa touche sans pareille. Yb company est fier de collaborer avec Amine Bendriouich pour la production de ses collections.",
      ],
      paragraphs: [],
      links: [
        { label: "Facebook", href: "https://www.facebook.com/Bendriouich.A" },
        { label: "Instagram", href: "https://www.instagram.com/aminebendriouich/" },
        { label: "visiter le site", href: "http://amine.bendriouich.com" },
      ],
      cover: "partenaires-mode-36",
      gallery: [37, 41],
      collaboration: true,
    },
    {
      key: "jnoun",
      title: "jnoun ( meriem &amp; sara bennani )",
      paragraphs: [
        "L’envie et la passion de deux sœurs marocaines pour la création et la mode, a donné naissance à la marque très connue",
        "« JNOUN », ce studio qui évolue entre le Maroc, la France et les USA. YB Company a participé à la création de la collection, en tant qu’atelier de confection et de mode.",
      ],
      links: [
        { label: "Facebook", href: "https://www.facebook.com/jnounstudio/" },
        { label: "Instagram", href: "https://www.instagram.com/jnounstudio/?hl=fr" },
      ],
      cover: "partenaires-mode-42",
      gallery: [43, 53],
      collaboration: true,
    },
    {
      key: "hashtag",
      title: "#HASHTAG",
      paragraphs: [
        "Si vous cherchez un t-shirts, crop tops ou mugs avec des inscriptions originales, #HASHTAG vous en propose. En partenariat avec SOS Villages d’Enfants Maroc, un pourcentage est versé à l’association pour tout achat, de quoi combiner shopping et bonne cause en soulageant notre conscience J #HASHTAG a fait confiance à YB Company pour la production de ses collections, et nous en sommes ravis #proudteam",
      ],
      links: [
        {
          label: "Facebook",
          href: "https://www.facebook.com/pg/HASHTAG-1507053469563437/posts/?ref=page_internal",
        },
        { label: "Instagram", href: "https://www.instagram.com/hashtag_maroc/?hl=fr" },
      ],
      cover: "partenaires-mode-54",
      gallery: [55, 61],
      collaboration: true,
    },
  ] as PartnerStory[],
};

export const confectionSport = {
  h1: "CONFECTION SPORT",
  intro:
    "La polyvalence et l’expertise a permis à YB Company de collaborer avec plusieurs marques dans le domaine du textile et habillement, aussi variées que prestigieuses, nationales et internationales dans la MODE et SPORTSWEAR.",
  partners: [
    {
      title:
        "TRIBORD<br><br>Tribord est la marque des sports d’eau (glisse, plongée, voile, kayak) du groupe Decathlon.",
      name: "TRIBORD",
      image: "confection-sport-01",
    },
    {
      title:
        "nabaji<br><br>nabaji est la marque de maillots de bain et accessoires de plages et piscine pour homme, femme et enfant.",
      name: "nabaji",
      image: "confection-sport-02",
    },
    {
      title: "NTK",
      name: "NTK",
      text: "NTK est une marque de vêtement dédiée au sport, proposant à la vente toute une ligne de vêtements pour sportifs, sur le terrain comme en dehors.",
      image: "confection-sport-03",
    },
    {
      title: "PRIDEORDIE",
      name: "PRIDEORDIE",
      text: "La marque PrideOrDie est spécialisé dans la vente en ligne de vêtement de sports de combat et MMA",
      image: "confection-sport-04",
    },
    {
      title: "TIBUE MAROC",
      name: "TIBUE MAROC",
      text: "TIBU Maroc est association à but non lucratif, créée et composée par des jeunes passionnés de la balle orange. Travaillant en collaboration avec des partenaires privés et publics engagés dans le milieu associatif, elle contribue à promouvoir et à développer le basketball au Maroc",
      image: "confection-sport-05",
    },
  ] as { title: string; name: string; text?: string; image: string }[],
};
