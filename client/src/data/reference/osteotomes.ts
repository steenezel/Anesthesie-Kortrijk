export interface OsteotomeImage {
  id: "upper-limb" | "lower-limb";
  title: string;
  subtitle: string;
  src: string;
  alt: string;
}

export const OSTEOTOME_INTRO =
  "Osteotomen tonen welke zenuwen sensorische innervatie leveren aan botsegmenten. Handig bij interpretatie van pijn en uitstraling na trauma of chirurgie.";

export const OSTEOTOME_IMAGES: OsteotomeImage[] = [
  {
    id: "upper-limb",
    title: "Bovenste extremiteit",
    subtitle: "Anterior en posterior — suprascapularis, axillaris, medianus, ulnaris, radialis",
    src: "/images/reference/osteotome-upper-limb.png",
    alt: "Osteotomen bovenste extremiteit — anterior en posterior zenuwgebieden per bot",
  },
  {
    id: "lower-limb",
    title: "Onderste extremiteit",
    subtitle: "Anterior (A) en posterior (B) — obturator, femoralis, peroneus, tibialis, sciaticus",
    src: "/images/reference/osteotome-lower-limb.png",
    alt: "Osteotomen onderste extremiteit — anterior en posterior zenuwgebieden per bot",
  },
];
