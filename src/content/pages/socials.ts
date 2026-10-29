// "Facebook / Linkedin / Instagram" link rows at the bottom of several live pages (hrefs verbatim).
const linkedin = { label: "Linkedin", href: "https://www.linkedin.com/company/11144322/" };
const instagram = { label: "Instagram", href: "https://www.instagram.com/ybcompanymaroc/" };
const fb = (href: string) => ({ label: "Facebook", href });

export const pageSocials: Record<string, { label: string; href: string }[]> = {
  "sport-casual": [fb("https://www.facebook.com/ybcompanyfashion/"), linkedin, instagram],
  mode: [fb("https://www.facebook.com/ybcompanyfashion/"), linkedin, instagram],
  sublimation: [fb("https://www.facebook.com/ybcompanycom/"), linkedin, instagram],
  "grand-format": [fb("https://www.facebook.com/ybcompanycom/?ref=br_rs"), linkedin, instagram],
  structures: [
    fb("https://www.facebook.com/pg/ybcompanycom/photos/?ref=page_internal"),
    linkedin,
    instagram,
  ],
  "sac-non-tisse": [fb("https://www.facebook.com/ybcompanycom/"), linkedin, instagram],
  "sac-tissu": [fb("https://www.facebook.com/ybcompanycom/?ref=br_tf"), linkedin, instagram],
  "partenaires-mode": [fb("https://www.facebook.com/ybcompanyfashion/"), linkedin, instagram],
  "confection-sport": [fb("https://www.facebook.com/ybcompanyfashion/"), linkedin, instagram],
};
