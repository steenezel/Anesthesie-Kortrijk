export type BodyViewSide = "front" | "back";

export type BodyRegionId =
  | "neck"
  | "upper-limb"
  | "thorax-anterior"
  | "thorax-lateral"
  | "thorax-posterior"
  | "abdomen"
  | "lower-limb";

export interface BodyRegionBlock {
  /** Route slug, e.g. `/blocks/isb` */
  id: string;
  label: string;
}

export interface BodyRegion {
  id: BodyRegionId;
  label: string;
  /** Which body views expose this region */
  views: BodyViewSide[];
  blocks: BodyRegionBlock[];
}

export const BODY_REGIONS: Record<BodyRegionId, BodyRegion> = {
  neck: {
    id: "neck",
    label: "Neck",
    views: ["front"],
    blocks: [
      { id: "cervical-plexus", label: "Cervical plexus" },
      { id: "isb", label: "ISB" },
      { id: "supraclavicular", label: "Supraclavicular" },
      { id: "suprascapular", label: "Suprascapular" },
      { id: "clavipectoral", label: "Clavipectoral" },
    ],
  },
  "upper-limb": {
    id: "upper-limb",
    label: "Upper Limb",
    views: ["front", "back"],
    blocks: [
      { id: "isb", label: "Interscalene (ISB)" },
      { id: "supraclavicular", label: "Supraclavicular" },
      { id: "infraclavicular", label: "Infraclavicular" },
      { id: "axillary", label: "Axillary" },
      { id: "suprascapular", label: "Suprascapular" },
    ],
  },
  "thorax-anterior": {
    id: "thorax-anterior",
    label: "Thorax (Anterior)",
    views: ["front"],
    blocks: [
      { id: "tpvb", label: "TPVB" },
      { id: "pecs", label: "PECS I / II" },
      { id: "serratus", label: "Serratus anterior" },
    ],
  },
  "thorax-lateral": {
    id: "thorax-lateral",
    label: "Thorax (Lateral)",
    views: ["front"],
    blocks: [
      { id: "tpvb", label: "TPVB" },
      { id: "serratus", label: "Serratus anterior" },
    ],
  },
  "thorax-posterior": {
    id: "thorax-posterior",
    label: "Thorax (Posterior)",
    views: ["back"],
    blocks: [
      { id: "tpvb", label: "TPVB" },
      { id: "esp", label: "ESP block" },
    ],
  },
  abdomen: {
    id: "abdomen",
    label: "Abdomen",
    views: ["front"],
    blocks: [
      { id: "tap", label: "TAP block" },
      { id: "rectus-sheath", label: "Rectus sheath" },
      { id: "quadratus-lumborum", label: "Quadratus lumborum" },
    ],
  },
  "lower-limb": {
    id: "lower-limb",
    label: "Lower Limb",
    views: ["front", "back"],
    blocks: [
      { id: "femoral", label: "Femoral" },
      { id: "adductor-canal", label: "Adductor canal (ACB)" },
      { id: "sciatic", label: "Sciatic" },
      { id: "popliteal", label: "Popliteal" },
      { id: "ankle", label: "Ankle block" },
    ],
  },
};

export function getRegionsForView(view: BodyViewSide): BodyRegion[] {
  return Object.values(BODY_REGIONS).filter((region) => region.views.includes(view));
}
