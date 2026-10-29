// Verbatim text from https://ybcompany.ma — do not edit wording.

export const sacherie = {
  h1: "Production de sac",
  // The live page body is empty (broken slider shortcode). Hero slides: the generated "sacs"
  // image, then the two best live bag photos (image-map.json); links use menu labels.
  slides: ["sacherie-slide-1", "sacherie-slide-2", "sacherie-slide-3"],
  links: [
    {
      label: "Production de sac non tissé",
      to: "/http-ybcompany-ma-production-de-sac/production-de-sac-non-tisse/",
      image: "sac-non-tisse-13",
    },
    {
      label: "Production de sac en tissu",
      to: "/http-ybcompany-ma-production-de-sac/production-de-sac-en-tissu/",
      image: "sac-tissu-01",
    },
  ],
};

export const sacNonTisse = {
  h1: "Production de sac écologique non tissé TNT",
  h2: "Fabricant de sac non tissé par excellence",
  paragraphs: [
    "Êtes-vous à la recherche d’un sac durable et réutilisable ? Êtes-vous à la recherche d’une valeur sure dans l’univers de l’objet publicitaire. Alors ne cherchez plus. Les sacs non-tissé en polypropylène sont les modèles qu’il vous faut. Ils sont solides et constituent un outil publicitaire à fort potentiel.",
    "Les sacs non tissés pourront être personnalisés et prendront la couleur, le format, la finition et l’impression que vous désirez. Vous donnant ainsi une visibilité optimale. Le sac écologique non tissé sera pour vous un article publicitaire de qualité qui vous permettra de promouvoir votre publicité et communication tout au long de l’année.",
  ],
  types: [
    {
      title: "sacs shopping",
      text: "Ils sont utilisé par les commerces de proximité. Les sacs shopping appelés aussi sacs alimentaires, sacs à bretelles ou sacs t-shirts sont de plus en plus populaire.",
      image: "sac-non-tisse-02",
    },
    {
      title: "sacs poignet",
      text: "Très pratique en vue de leur forme le sac à poignet perforé est souvent utilisé dans les commerces du type pharmacie, magasin de mode...",
      image: "sac-non-tisse-03",
    },
    {
      title: "sacs avec anses",
      text: "Idéal pour mettre en évidence votre identité visuel, et développer votre image de marque. Très utilisé lors des évènements, foires…",
      image: "sac-non-tisse-04",
    },
  ],
  realisations: "nos Récentes réalisations",
  gallery: [5, 13] as [number, number],
};

export const sacTissu = {
  h1: "Production de sac en tissu sublimé",
  h2: "Fabricant de sac en tissu par excellence",
  paragraph:
    "Nous sommes aussi un fabricant de sac en tissu. Nous vous proposons des sacs publicitaires réalisés avec soin pour le plus grand bonheur de vos clients. Un sac publicitaire en tissu, qui mettra en avant votre notoriété. Votre sac sera 100% personnalisé. Vous déciderez de la couleur, de la taille, du type de tissu, et du visuel souhaité en sublimation .",
  goutsTitle: "il y en a pour tout les goûts",
  gouts: [1, 8] as [number, number],
  realisations: "nos récentes réalisations - sac en tissu",
  gallery: [9, 23] as [number, number],
};
