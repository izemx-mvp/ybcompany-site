// Verbatim text from https://ybcompany.ma — do not edit wording.

export const sportCasual = {
  h1: "société de textile",
  kicker: "sportswear - ACTIVEWEAR - casual",
  // The live page holds these four paragraphs in one block separated by <br><br>.
  paragraphs: [
    "<strong>La confection de vêtements de sport</strong> est l’un de nos points forts. En effet, nous sommes spécialisés dans la <strong>production des tenues de sport</strong>. Nous vous accompagnons dans la création <strong>d’articles personnalisés</strong> aux couleurs de votre marque, club de sports, universités, écoles, entreprise ou de votre association en définissant librement avec notre atelier de création graphique votre futur <strong>modèle sportif</strong>.",
    "Chez YB COMPANY, vous trouverez les dernières <strong>collections sportswear sublimées </strong> aux couleurs de votre choix. Nous vous conseillons dans l’élaboration et <strong>la</strong> <strong>production de vêtements de sport</strong> les plus adaptées à votre besoin. Que vous ayez besoin de <strong>maillots de foot, rashguards</strong>, <strong> shorts, survêtements, gilet, ensemble sportif</strong> ou autres.",
    "Nous maîtrisons parfaitement le processus de <strong>production des tenues de sport</strong> tout en sélectionnant les meilleures sources d’approvisionnement et en appliquant vigoureusement nos procédures de contrôle qualité. Nous mettons à votre disposition notre expertise en tant que <strong>fabricant de textile</strong>.",
    "Nos productions sont toutes sur mesure, c’est vous qui décidez des caractéristiques du vêtement. Les tarifs incluent l’impression de tous vos logos, sponsors, textes et la personnalisation intégrale de votre design.",
  ],
  // H3 headings verbatim (with their original line breaks) + live image index.
  sports: [
    { html: "Tenue de RUGBY", image: 1 },
    { html: "TENUE DE<br>HOCKEY", image: 2 },
    { html: "Tenue de BASKETBALL", image: 3 },
    { html: "TENUE DE HANDBALL", image: 4 },
    { html: "TENUE DE FOOTBALL", image: 5 },
    { html: "TENUE DE SPORT DE COMBAT", image: 6 },
    { html: "TENUE DE RUNNING", image: 7 },
    { html: "TENUE de<br>cyclisme", image: 8 },
  ],
  realisations: "Réalisations RÉCENTES -tenue de sport",
  partnersLink: { label: "PARTENAIRES", to: "/confection-sport/" },
  galleries: [
    { key: "football", title: "MAILLOT DE FOOTBALL", from: 9, to: 23 },
    { key: "basketball", title: "MAILLOT DE BASKETBALL", from: 24, to: 35 },
    { key: "combat", title: "sport de combat", from: 36, to: 48 },
    { key: "fitness", title: "Fitness", from: 49, to: 71 },
    { key: "rugby", title: "MAILLOT de RUGBY", from: 72, to: 75 },
  ],
};

export const mode = {
  h1: "société de confection",
  kicker: "MODE - FASHION - streetwear",
  intro:
    "Nous sommes un <strong>fabricant de vêtements textiles</strong> basé à <strong>Casablanca</strong>, nos produits sont destinés à l'export mais nous opérons également partout au Maroc (Marrakech, Rabat, Agadir, Tanger..). Dans nos <strong>ateliers de confection textile</strong>, nous disposons de tous les outils nécessaires de dernière génération, afin de vous accompagner dans l<strong>a confection de vêtements</strong> et <strong>la production de votre ligne de vêtements</strong> pour tous les genres : hommes, femme, enfant. Nous comptons parmi nos collaborations des noms reconnus dans le domaine de <strong>la production fashion et l’industrie du textile. </strong>",
  // Atelier journey. Each block: { p } paragraph (html) or { ul } list (html items).
  steps: [
    {
      label: "STYLISME",
      image: "mode-stylisme",
      blocks: [
        { p: "Notre plate-forme apporte à nos clients une valeur ajoutée en matière de CREATION." },
        { p: "Nous pouvons :" },
        {
          ul: [
            "Conseiller le client dans l’amélioration de son produit.",
            "Compléter une collection client.",
            "Proposer des collections selon les orientations du client.",
            "Un STYLISTE en interne est à la disposition du client.",
          ],
        },
      ],
    },
    {
      label: "MODÉLISME",
      image: "mode-modelisme",
      blocks: "ARTICLES",
    },
    {
      label: "TRAITEMENT",
      image: "mode-traitement",
      blocks: [
        { p: "<strong>Sublimation</strong>" },
        {
          p: "La sublimation est le procédé le plus simple et le plus efficace pour l’application de photos et de motif de <strong>haute qualité</strong> sur vos créations. Le motif est transféré dans la masse du tissu ce qui permet d’obtenir un <strong>produit parfaitement homogène au toucher et une définition d’image supérieure</strong>.<br>Cette technique permet aussi une totale liberté dans la création, pour des produits orignaux.",
        },
        { p: "<strong>BRODERIE, SERIGRAPHIE, TRANSFERT</strong>" },
        {
          p: "YB COMPANY offre la possibilité de développer toute sorte de BRODERIE, SERIGRAPHIE et TRANSFERT sur le vêtement. Nous pouvons partir d’un motif sur une photo, croquis ou shopping vous développer le programme approprié en livrant un prototype.<br>Tous ces travaux sont réalisés, dans un maximum de REACTIVITE, dans des sites spécialisés qui représentent une extension des activités de YB COMPANY.",
        },
      ],
    },
    {
      label: "Confection de vêtement",
      image: "mode-confection",
      blocks: [
        {
          p: "Un atelier de CONFECTION textile moderne et bien équipé est intégré dans les locaux de YB COMPANY pour:",
        },
        {
          ul: [
            "Monter les PROTOTYPES dans des conditions industrielles.",
            "Réaliser les REPETITIONS de collection.",
          ],
        },
        {
          p: "Cet « atelier » est organisé pour répondre, en toute REACTIVITE, à la demande du client quelque soit sa complexité. Tout en assurant une QUALITE dans les normes du marché.",
        },
        {
          p: "Ce sont des opérateurs, confirmés et autonomes qui occupent cet atelier de confection et prennent en charge la réalisation des articles de collection.",
        },
      ],
    },
    {
      label: "Produit",
      image: "mode-produit",
      blocks: "ARTICLES",
    },
  ] as {
    label: string;
    image: string;
    blocks: "ARTICLES" | ({ p: string } | { ul: string[] })[];
  }[],
  // Shared block used by MODÉLISME and Produit on the live page.
  articles: [
    { p: "<strong>ARTICLES</strong>" },
    {
      p: "Notre expérience est solide dans les articles sport’s wear, casual wear et équivalent. Nous maîtrisons tous les articles dans ces catégories :",
    },
    {
      ul: [
        "Pantalon, pantacourt, bermuda, short, jupe, salopette",
        "Veste déstructurée, jacket, gilet, parka,",
        "Chemise, chemisier",
      ],
    },
    { p: "<strong>RESEAUX</strong>" },
    { p: "Nous maîtrisons tout article : Homme / Femme / Enfant / Bébé" },
    { p: "<strong>MATIERES</strong>" },
    {
      p: "La qualification de nos techniciens et la flexibilité de nos équipements, permettent la maîtrise de toute matière du genre :",
    },
    {
      ul: [
        "<strong>CHAINE ET TRAME</strong>Catégorie : Denim, gabardine, toile, satiné, etc.Composition : coton, coton /élasthanne, polyamide, polyester, tencel, etc.",
        "<strong>MAILLE</strong>Catégorie: jersey, molleton, cote, etc.Composition : coton, coton /élasthanne, viscose, polyamide, polyester,etc.",
      ],
    },
  ] as ({ p: string } | { ul: string[] })[],
  realisations: "Nos rÉcenteS réalisations",
  partnersLink: {
    label: "PARTENAIRES",
    to: "/partenaires-references/textile-habillement-mode-sport/",
  },
};

export const sublimation = {
  h1: "sublimation textile de maison",
  intro: [
    "Nous vous offrons une large variété de prestations autour de la <strong>sublimation Textiles</strong>, qui concernent à la fois <strong>l’habillement</strong> destiné à plusieurs segments du marché, que celui du <strong>textile de maison</strong>, qui concerne aussi plusieurs catégories de produits.",
    "Plusieurs produits de textile de maison nécessitent une créativité artistique très élevée, pour plaire aux goûts des consommateurs, de plus en plus évolutifs.<br>Les tendances de mode s’appliquent aussi aux différents produits du textile de maison, tout en réclamant l’originalité et production limitée des modèles.<br>Aujourd’hui plusieurs types de clients demandent la sublimation pour le textile de maison, nous pouvons citer quelques-uns",
  ],
  clients: [
    "La distribution spécialisée",
    "L’hôtellerie, restauration…",
    "Des lieux publics",
    "Les décorateurs d’intérieurs",
  ],
  h2a: "impression sur tissu",
  h2b: "impression sur textile",
  productsIntro:
    "Les produits qui peuvent concerner cette technique sont aussi vastes, et font appel à la créativité de leurs concepteurs.<br>La liste des produits ne cessent de s’élargir :",
  products: [
    "Impression personnalisée pour les tissus de fauteuils, chaises, canapés, coussins, pouf…",
    "Calandrage sur tissu",
    "Impression personnalisée sur tissu pour les rideaux.",
  ],
};
