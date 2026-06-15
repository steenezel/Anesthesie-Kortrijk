export type BodyRegionId =
  | "head-neck"
  | "upper-extremity"
  | "thorax"
  | "abdomen"
  | "back"
  | "lower-extremity";

export interface BodyRegionConfig {
  id: BodyRegionId;
  label: string;
  /** Short code shown inside marker when no block count */
  shortLabel: string;
  /** Position on combined front/back image (percentages) */
  x: number;
  y: number;
  /** Semi-transparent fill + border */
  color: string;
  borderColor: string;
}

export interface AtlasBlock {
  id: string;
  title: string;
  body_regions: BodyRegionId[];
}

export interface RegionWithBlocks {
  config: BodyRegionConfig;
  blocks: { id: string; label: string }[];
}

export const BODY_MAP_IMAGE = "/images/blocks/body-map-front-back.png";

export const BODY_REGION_CONFIGS: Record<BodyRegionId, BodyRegionConfig> = {
  "head-neck": {
    id: "head-neck",
    label: "Head & Neck",
    shortLabel: "HN",
    x: 29,
    y: 21,
    color: "rgba(13, 148, 136, 0.45)",
    borderColor: "rgb(13, 148, 136)",
  },
  "upper-extremity": {
    id: "upper-extremity",
    label: "Upper Extremity",
    shortLabel: "UE",
    x: 19,
    y: 40,
    color: "rgba(124, 58, 237, 0.45)",
    borderColor: "rgb(124, 58, 237)",
  },
  thorax: {
    id: "thorax",
    label: "Thorax",
    shortLabel: "TX",
    x: 35,
    y: 30,
    color: "rgba(37, 99, 235, 0.45)",
    borderColor: "rgb(37, 99, 235)",
  },
  abdomen: {
    id: "abdomen",
    label: "Abdomen",
    shortLabel: "AB",
    x: 31,
    y: 42,
    color: "rgba(234, 88, 12, 0.45)",
    borderColor: "rgb(234, 88, 12)",
  },
  back: {
    id: "back",
    label: "Back",
    shortLabel: "BK",
    x: 68,
    y: 34,
    color: "rgba(79, 70, 229, 0.45)",
    borderColor: "rgb(79, 70, 229)",
  },
  "lower-extremity": {
    id: "lower-extremity",
    label: "Lower Extremity",
    shortLabel: "LE",
    x: 27,
    y: 72,
    color: "rgba(5, 150, 105, 0.45)",
    borderColor: "rgb(5, 150, 105)",
  },
};

export const BODY_REGION_OPTIONS = Object.values(BODY_REGION_CONFIGS);

const VALID_REGION_IDS = new Set<string>(Object.keys(BODY_REGION_CONFIGS));

export function parseBodyRegions(raw: unknown): BodyRegionId[] {
  if (!raw) return [];

  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,;]/).map((part) => part.trim())
      : [];

  return values.filter((value): value is BodyRegionId => VALID_REGION_IDS.has(value));
}

export function buildRegionsWithBlocks(blocks: AtlasBlock[]): RegionWithBlocks[] {
  return BODY_REGION_OPTIONS.map((config) => ({
    config,
    blocks: blocks
      .filter((block) => block.body_regions.includes(config.id))
      .map((block) => ({ id: block.id, label: block.title }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  }));
}
