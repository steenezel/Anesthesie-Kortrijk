export type LogbookCategoryId = "LRA" | "Arterieel" | "Centraal";

export interface LogbookTechnique {
  id: string;
  label: string;
  shortLabel?: string;
  freeText?: boolean;
}

export interface LogbookSubCategory {
  id: string;
  label: string;
  shortLabel?: string;
  techniques: LogbookTechnique[];
}

export interface LogbookCategory {
  id: LogbookCategoryId;
  label: string;
  description: string;
  subCategories: LogbookSubCategory[];
}

export const LOGBOOK_TREE: LogbookCategory[] = [
  {
    id: "LRA",
    label: "LRA",
    description: "Locoregionale anesthesie",
    subCategories: [
      {
        id: "Neuraxiaal",
        label: "Neuraxiaal",
        techniques: [
          { id: "epiduraal-lumbaal", label: "Epiduraal lumbaal" },
          { id: "epiduraal-thoracaal", label: "Epiduraal thoracaal" },
          { id: "spinaal", label: "Spinaal" },
          { id: "cse", label: "CSE" },
          { id: "caudaal", label: "Caudaal" },
        ],
      },
      {
        id: "BLM",
        label: "BLM",
        shortLabel: "Bovenste lidmaat",
        techniques: [
          { id: "isb", label: "Interscaleen (ISB)", shortLabel: "ISB" },
          { id: "supraclaviculair", label: "Supraclaviculair" },
          { id: "infraclaviculair", label: "Infraclaviculair" },
          { id: "costoclavicular", label: "Costoclavicular" },
          { id: "axillair", label: "Axillair" },
          { id: "icbn", label: "Intercostobrachial nerve" },
          { id: "polsblock", label: "Polsblock" },
        ],
      },
      {
        id: "OLM",
        label: "OLM",
        shortLabel: "Onderste lidmaat",
        techniques: [
          { id: "fascia-iliaca", label: "FASCIA iliaca" },
          { id: "femoral nerve", label: "Femoral nerve" },
          { id: "adductor-canal", label: "Adductor canal" },
          { id: "ipack", label: "iPACK" },
          { id: "geniculars", label: "Geniculars" },
          { id: "peng", label: "PENG" },
          { id: "sciatic-subgluteaal", label: "Sciatic (subgluteaal)" },
          { id: "poplitea", label: "Poplitea" },
          { id: "enkelblock", label: "Enkelblock" },
        ],
      },
      {
        id: "Thorax",
        label: "Thorax",
        techniques: [
          { id: "esp-thoracaal", label: "ESP thoracaal" },
          { id: "pecs", label: "PECS I/II" },
          { id: "sap", label: "Serratus anterior plane (SAP)", shortLabel: "SAP" },
          { id: "parasternal", label: "Parasternal" },
          { id: "paravertebral", label: "Paravertebral" },
        ],
      },
      {
        id: "Abdomen",
        label: "Abdomen",
        techniques: [
          { id: "tap", label: "TAP block", shortLabel: "TAP" },
          { id: "rectus-sheath", label: "Rectus sheath" },
          { id: "esp-lumbaal", label: "ESP lumbaal" },
          { id: "qlb", label: "Quadratus lumborum (QLB)", shortLabel: "QLB" },
          { id: "ilioinguinaal", label: "Ilioinguinaal/Iliohypogastrisch" },
        ],
      },
      {
        id: "Hals",
        label: "Hals",
        techniques: [
          { id: "plexus-cervicalis", label: "Oppervlakkige plexus cervicalis" },
          { id: "clavipectoral", label: "Clavipectoral" },
        ],
      },
      {
        id: "Andere",
        label: "Andere",
        techniques: [
          {
            id: "vrij-veld",
            label: "Vrij veld / overige techniek",
            shortLabel: "Vrij veld",
            freeText: true,
          },
        ],
      },
    ],
  },
  {
    id: "Arterieel",
    label: "Arterieel",
    description: "Arteriële lijnen",
    subCategories: [
      {
        id: "Radialis",
        label: "Radialis",
        techniques: [
          { id: "radialis-echo", label: "Echo-geleid" },
          { id: "radialis-palpatie", label: "Palpatie" },
        ],
      },
      {
        id: "Femoralis",
        label: "Femoralis",
        techniques: [
          { id: "femoralis-echo", label: "Echo-geleid" },
          { id: "femoralis-palpatie", label: "Palpatie" },
        ],
      },
      {
        id: "Brachialis",
        label: "Brachialis",
        techniques: [
          { id: "brachialis-echo", label: "Echo-geleid" },
          { id: "brachialis-palpatie", label: "Palpatie" },
        ],
      },
    ],
  },
  {
    id: "Centraal",
    label: "Centraal",
    description: "CVC / PICC",
    subCategories: [
      {
        id: "VJI",
        label: "V. Jugularis Interna",
        shortLabel: "VJI",
        techniques: [
          { id: "vji-echo", label: "Echo-geleid" },
          { id: "vji-landmark", label: "Landmark" },
        ],
      },
      {
        id: "Subclavia",
        label: "V. Subclavia",
        shortLabel: "Subclavia",
        techniques: [
          { id: "subclavia-echo", label: "Echo-geleid" },
          { id: "subclavia-landmark", label: "Landmark" },
        ],
      },
      {
        id: "VFemoralis",
        label: "V. Femoralis",
        techniques: [
          { id: "vfem-echo", label: "Echo-geleid" },
          { id: "vfem-landmark", label: "Landmark" },
        ],
      },
      {
        id: "PICC",
        label: "PICC-lijn / Midline",
        shortLabel: "PICC",
        techniques: [{ id: "picc-echo", label: "Echo-geleid" }],
      },
    ],
  },
];

export function getLogbookCategory(id: string) {
  return LOGBOOK_TREE.find((category) => category.id === id);
}

export function getLogbookSubCategory(categoryId: string, subCategoryId: string) {
  return getLogbookCategory(categoryId)?.subCategories.find(
    (sub) => sub.id === subCategoryId,
  );
}

export function techniqueDisplayName(technique: LogbookTechnique) {
  return technique.shortLabel ?? technique.label;
}

export const SUPERVISION_LEVELS = [
  { id: "gekeken", label: "Gekeken", shortLabel: "Gekeken" },
  { id: "onder-supervisie", label: "Onder supervisie uitgevoerd", shortLabel: "Onder supervisie" },
  { id: "zelfstandig", label: "Zelfstandig uitgevoerd", shortLabel: "Zelfstandig" },
  { id: "als-supervisor", label: "Als supervisor uitgevoerd", shortLabel: "Als supervisor" },
] as const;
