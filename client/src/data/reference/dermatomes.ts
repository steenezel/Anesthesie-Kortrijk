/** Static dermatome reference — clinical landmark table (classic dermatome map). */

export const DERMATOME_MAP_IMAGE = "/images/reference/dermatome-map.png";

export const DERMATOME_OVERLAP_NOTE =
  "Schematische afbakening van dermatomen als afzonderlijke segmenten. Er is in werkelijkheid aanzienlijke overlap tussen twee aangrenzende dermatomen.";

export interface DermatomeDetailImage {
  id: "hand" | "foot" | "lower-limb";
  title: string;
  subtitle: string;
  src: string;
  alt: string;
  attribution?: string;
}

export const DERMATOME_DETAIL_IMAGES: DermatomeDetailImage[] = [
  {
    id: "hand",
    title: "Hand",
    subtitle: "Palmaire en dorsale zenuwgebieden — medianus, ulnaris, radialis",
    src: "/images/reference/dermatome-hand.png",
    alt: "Dermatomes of the hand — palmar and dorsal nerve territories",
    attribution: "Bron: EBM Consult",
  },
  {
    id: "foot",
    title: "Voet",
    subtitle: "Dorsaal, plantair, mediaal en lateraal — peroneaal, suraal, saphenus",
    src: "/images/reference/dermatome-foot.png",
    alt: "Sensory nerve distribution of the foot — dorsal, plantar, medial and lateral views",
    attribution: "Bron: NYSORA",
  },
  {
    id: "lower-limb",
    title: "Onderste extremiteit",
    subtitle:
      "Cutane zenuwgebieden (linker paneel). Osseuze verdeling rechts — zie ook Osteotomen.",
    src: "/images/reference/lower-limb-cutaneous-osseous.png",
    alt: "Cutane zenuwverdeling onderste extremiteit — anterior en posterior",
    attribution: "Bron: J Gentry, ASRA",
  },
];

export interface DermatomeLandmarkRow {
  levels: string;
  landmark: string;
}

/** Levels of principal dermatomes — klinische referentie */
export const DERMATOME_LANDMARKS: DermatomeLandmarkRow[] = [
  { levels: "C5", landmark: "Claviculae" },
  { levels: "C5, C6, C7", landmark: "Laterale zijde bovenste extremiteit" },
  { levels: "C8, T1", landmark: "Mediale zijde bovenste extremiteit" },
  { levels: "C6", landmark: "Duim" },
  { levels: "C6, C7, C8", landmark: "Hand" },
  { levels: "C8", landmark: "Ring- en pinkvinger" },
  { levels: "T4", landmark: "Niveau tepels" },
  { levels: "T10", landmark: "Niveau navel" },
  { levels: "T12", landmark: "Lies / grote schaamlip" },
  { levels: "L1–L4", landmark: "Voor- en binnenzijde onderste extremiteit" },
  { levels: "L4, L5, S1", landmark: "Voet" },
  { levels: "L4", landmark: "Mediale zijde grote teen" },
  { levels: "S1, S2, L5", landmark: "Achter- en buitenzijde onderste extremiteit" },
  { levels: "S1", landmark: "Laterale rand voet en pinkteen" },
  { levels: "S2–S4", landmark: "Perineum" },
];
