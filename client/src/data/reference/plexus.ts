export interface PlexusExtraImage {
  src: string;
  title: string;
  attribution?: string;
}

export interface PlexusReference {
  id: string;
  title: string;
  /** Spinale niveaus, bv. L1–L5 */
  levels: string;
  imageSrc?: string;
  attribution?: string;
  description?: string;
  /** Extra figuren op dezelfde pagina (bv. cutane innervatie) */
  extraImages?: PlexusExtraImage[];
}

export const PLEXUS_REFERENCES: PlexusReference[] = [
  {
    id: "brachiaal",
    title: "Brachiale plexus",
    levels: "C5–T1",
    imageSrc: "/images/reference/plexus/brachiaal.png",
    description:
      "Wortels, trunks, divisies, cords en terminale takken naar de bovenste extremiteit.",
  },
  {
    id: "cervicaal",
    title: "Cervicale plexus",
    levels: "C1–C4 (+C5)",
    imageSrc: "/images/reference/plexus/cervicaal.png",
    description: "Hals, hoofd en schoudergordel — o.a. ansa cervicalis en n. phrenicus.",
    extraImages: [
      {
        src: "/images/reference/plexus/cervicaal-dermatomen.png",
        title: "Cutane innervatie — superficiele cervicale plexus",
      },
    ],
  },
  {
    id: "lumbaal",
    title: "Lumbale plexus",
    levels: "L1–L5",
    imageSrc: "/images/reference/plexus/lumbaal.png",
    description:
      "Vorming van o.a. n. femoralis, n. obturatorius, n. cutaneus femoris lateralis en truncus lumbosacralis.",
    extraImages: [
      {
        src: "/images/reference/lower-limb-nerves-branches.png",
        title: "Onderste ledemaat — cutane en motorische takken",
        attribution: "Bron: clinicalgate.com",
      },
    ],
  },
  {
    id: "sacraal",
    title: "Sacrale plexus",
    levels: "L4–S4",
    imageSrc: "/images/reference/plexus/sacraal.png",
    attribution: "Craig Hacking 2015, CC-BY-SA-NC — Radiopaedia.org",
    description:
      "Vorming van o.a. n. ischiadicus, nervi glutei, n. pudendus en takken naar het bekken.",
    extraImages: [
      {
        src: "/images/reference/lower-limb-nerves-branches.png",
        title: "Onderste ledemaat — ischiadicus en distale takken",
        attribution: "Bron: clinicalgate.com",
      },
    ],
  },
];

export function getPlexusById(id: string): PlexusReference | undefined {
  return PLEXUS_REFERENCES.find((plexus) => plexus.id === id);
}
