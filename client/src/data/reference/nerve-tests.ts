export interface NerveTestImage {
  id: "hand" | "lower-limb";
  title: string;
  subtitle: string;
  src: string;
  alt: string;
  attribution?: string;
}

export const NERVE_TEST_INTRO =
  "Bedside-testen om motoriek, sensibiliteit en perfusie te beoordelen — nuttig na regionale anesthesie, trauma of chirurgie. Hand: score 1 = intact, 2 = verminderd, 3 = afwezig.";

export const NERVE_TEST_IMAGES: NerveTestImage[] = [
  {
    id: "hand",
    title: "Hand",
    subtitle:
      "Motor: AIN (OK-teken), PIN (duim omhoog), medianus (vuist), radiaal (paper), ulnaris (schaar/kruis). Sensibel: wijsvinger, eerste web, pink. Vasculair: temperatuur, CRT, radialis-pols, kleur.",
    src: "/images/reference/nerve-test-hand.png",
    alt: "Neurologisch en vasculair onderzoek van de hand — motor, sensibel en vasculair",
    attribution: "Bron: AO Foundation",
  },
  {
    id: "lower-limb",
    title: "Onderste extremiteit — L4, L5, S1",
    subtitle:
      "Per wortelniveau: pijn- en gevoelsgebied, motoriek (quadriceps, dorsaalflexie grote teen, plantairflexie), functionele test (squat, hielen, tenen) en reflex (kniepees, enkelpees).",
    src: "/images/reference/nerve-test-lower-limb.png",
    alt: "Neurologisch onderzoek onderste extremiteit — L4, L5 en S1",
    attribution: "Bron: @ogdukeneurosurg",
  },
];
