// Verbatim text from https://ybcompany.ma — do not edit wording.

export const masques = {
  h1: "Notre engagement",
  paragraph:
    "Face à cette crise sanitaire sans précédent, nous joignons nos efforts à toutes les composantes de l’Etat et la société civile.Yb company met à votre disposition des masques de protection à prix réduit. Nous avons développer 2 types de masques, à savoir des masques de protection à usage unique ainsi que des masques de protection réutilisable après lavage. Par cette action, nous visons à protéger autant que possible ceux d’entre nous qui assurent la continuité des activités professionnelles autorisées et qui veillent sur la santé, l’approvisionnement et le bien-être de nos concitoyens en cette période de crise.",
  typesTitle: "2 types de masques sont disponibles",
  gallery: [1, 16] as [number, number],
  products: [
    {
      title: "MASQUE DE PROTECTION RÉUTILISABLE",
      image: "masques-17",
      specTitle: "CARACTÉRISTIQUES TECHNIQUES",
      specs: [
        ["Nom du produit", "MASQUE DE PROTECTION RÉUTILISABLE"],
        ["Type", "PERSONNALISÉ"],
        ["Utilisation", "REDUCTION DE PROJECTION SALIVAIRE"],
        ["Matière", "100% POLYESTER"],
        ["Couleur", "Divers"],
        ["Hauteur", "21 cm"],
        ["Largeur", "9 cm"],
        ["Grammage", "2 COUCHES"],
        ["Usage", "MULTIPLE APRÉS LAVAGE"],
      ],
    },
    {
      title: "MASQUE DE PROTECTION À USAGE UNIQUE : 2 ÉLASTIQUES",
      image: "masques-01",
      specTitle: "CARACTÉRISTIQUES TECHNIQUES",
      specs: [
        ["Nom du produit", "MASQUE DE PROTECTION À USAGE UINIQUE"],
        ["Type", "3 PLIS"],
        ["Utilisation", "REDUCTION DE PROJECTION SALIVAIRE"],
        ["Matière", "100% PP TISSU NON TISSE SPUNBOND SS"],
        ["Couleur", "Turquoise"],
        ["Hauteur", "21 cm"],
        ["Largeur", "9 cm"],
        ["Grammage", "C 1 : 20g/m² C 2 : 50g/m² C 3 : 25g/m²"],
        ["Usage", "UNIQUE"],
      ],
    },
  ],
};

export const protection = {
  products: [
    {
      title: "Combinaison de protection",
      text: "Les combinaisons de protection à usage unique dispose d’une capuche et fermeture à glissière. Légères, et confortable la combinaison offre une bonne protection de l’ensemble du corps. La combinaison est concus avec poignets élastiques optimisant ainsi la protection.",
      specs: [
        ["Grammage", "Sur demande ( 30 gr – 95 gr )"],
        ["Taille", "Standard ou sur demande"],
        ["Composition", "Polypropylène"],
        ["Quantité minimum", "1000"],
        ["Conditionnement", "1"],
      ],
      image: { live: "protection-01" },
    },
    {
      title: "Sur-blouse de protection",
      text: "Blouse de protection disposant de cordelettes élastiques aux poignets pour une protection idéal. Elle vous donne une sensation de confort grâce à la légèreté et la respirabilité du tissu utilisé.",
      specs: [
        ["Grammage", "Sue demande ( 25 gr – 40 gr )"],
        ["Taille", "Standard ou sur demande"],
        ["Composition", "Polypropylène"],
        ["Quantité minimum", "1000"],
        ["Conditionnement", "1"],
      ],
      image: { live: "protection-02" },
    },
    {
      title: "CHARLOTTE de protection",
      text: "Charlotte avec élastique de serrage est utilisée dans une multitude d’environnements de travail, tels que l’alimentaire, les laboratoires. Fabriquée en polypropylène elle dispose d’un montage à double aiguille.",
      specs: [
        ["Grammage", "10 gr"],
        ["Taille", "Standard"],
        ["Composition", "Polypropylène"],
        ["Quantité minimum", "5000"],
        ["Conditionnement", "100"],
      ],
      image: { live: "protection-03" },
    },
    {
      title: "Visière de protection",
      text: "Les visiéres de protection font partie de l’EPI ( équipement de Protection Individuelle) indispensable dans certains environnement de travail, Ils garantissent la protection des yeux et la protection de la peau de l’utilisateur. Pour protéger à la fois les yeux, le visage et une partie du cou, On vous propose un bon produit et on vous garantit la bonne qualité.",
      specs: [
        ["Taille", "Standard"],
        ["Composition", "Plexi"],
        ["Quantité minimum", "100"],
      ],
      image: { ambience: "prot-visiere" },
    },
  ] as {
    title: string;
    text: string;
    specs: string[][];
    image: { live?: string; ambience?: string };
  }[],
};
