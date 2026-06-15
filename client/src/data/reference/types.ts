export type ReferenceKind =
  | "dermatome"
  | "plexus"
  | "nerve"
  | "root"
  | "trunk"
  | "division"
  | "cord"
  | "branch";

export interface ReferenceStructure {
  id: string;
  kind: ReferenceKind;
  label: string;
  labelFull?: string;
  parentId?: string;
  origin?: string;
  course?: string;
  sensory?: string;
  motor?: string;
  clinicalDeficit?: string;
  notes?: string;
  blockIds?: string[];
  relatedIds?: string[];
  published?: boolean;
}

export type ReferenceModuleStatus = "available" | "coming_soon";

export interface ReferenceModuleCard {
  id: string;
  title: string;
  description: string;
  href: string;
  status: ReferenceModuleStatus;
}

/** Plexus/zenuwatlas (fase 2+): interactieve kaartzones */
export type HotspotShape = "circle" | "polygon" | "svg-path";

export interface CircleHotspotGeometry {
  x: number;
  y: number;
  r: number;
}

export interface MapViewConfig {
  id: string;
  label: string;
  imageSrc: string;
  imagePending?: boolean;
}

export interface Hotspot {
  structureId: string;
  mapViewId: string;
  shape: HotspotShape;
  geometry: CircleHotspotGeometry | { points: string } | { svgPathId: string };
  color?: string;
}
